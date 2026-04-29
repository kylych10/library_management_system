package com.kylych.service.impl;

import com.kylych.domain.PaymentGateway;
import com.kylych.domain.PaymentStatus;
import com.kylych.event.PaymentFailedEvent;
import com.kylych.event.PaymentInitiatedEvent;
import com.kylych.event.PaymentSuccessEvent;
import com.kylych.event.publisher.PaymentEventPublisher;
import com.kylych.exception.PaymentException;
import com.kylych.mapper.PaymentMapper;
import com.kylych.modal.*;
import com.kylych.payload.dto.PaymentDTO;
import com.kylych.payload.request.PaymentInitiateRequest;
import com.kylych.payload.request.PaymentVerifyRequest;
import com.kylych.payload.response.PaymentInitiateResponse;
import com.kylych.payload.response.RevenueStatisticsResponse;
import com.kylych.repository.*;
import com.kylych.service.PaymentService;
import com.kylych.service.gateway.StripeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BookLoanRepository bookLoanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentMapper paymentMapper;
    private final StripeService stripeService;
    private final FineRepository fineRepository;
    private final PaymentEventPublisher paymentEventPublisher;

    @Override
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) throws PaymentException {
        log.info("Initiating payment for user: {}, type: {}, gateway: {}",
                request.getUserId(), request.getPaymentType(), request.getGateway());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new PaymentException("User not found with ID: " + request.getUserId()));

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPaymentType(request.getPaymentType());
        payment.setGateway(request.getGateway() != null ? request.getGateway() : PaymentGateway.STRIPE);
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        payment.setDescription(request.getDescription());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId("TXN_" + UUID.randomUUID());
        payment.setInitiatedAt(LocalDateTime.now());

        if (request.getSubscriptionId() != null) {
            Subscription sub = subscriptionRepository.findById(request.getSubscriptionId())
                    .orElseThrow(() -> new PaymentException("Subscription not found"));
            payment.setSubscription(sub);
        }
        if (request.getBookLoanId() != null) {
            BookLoan loan = bookLoanRepository.findById(request.getBookLoanId())
                    .orElseThrow(() -> new PaymentException("Book loan not found"));
            payment.setBookLoan(loan);
        }
        if (request.getFineId() != null) {
            Fine fine = fineRepository.findById(request.getFineId())
                    .orElseThrow(() -> new PaymentException("Fine not found"));
            payment.setFine(fine);
        }

        payment = paymentRepository.save(payment);

        PaymentInitiateResponse response;
        if (payment.getGateway() == PaymentGateway.STRIPE) {
            response = stripeService.createPaymentIntent(payment);
        } else {
            // CASH / MANUAL / FREE — no external gateway call
            response = PaymentInitiateResponse.builder()
                    .paymentId(payment.getId())
                    .gateway(payment.getGateway())
                    .transactionId(payment.getTransactionId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .description(payment.getDescription())
                    .success(true)
                    .message("Payment recorded")
                    .build();
        }

        payment.setStatus(PaymentStatus.PROCESSING);
        payment = paymentRepository.save(payment);

        publishPaymentInitiatedEvent(payment, response.getCheckoutUrl());
        return response;
    }

    @Override
    public PaymentDTO verifyPayment(PaymentVerifyRequest request) throws PaymentException {
        boolean isValid = stripeService.verifyPayment(request.getStripePaymentIntentId());

        Payment payment = paymentRepository
                .findAll()
                .stream()
                .filter(p -> request.getStripePaymentIntentId() != null
                        && request.getStripePaymentIntentId().equals(p.getGatewayPaymentId()))
                .findFirst()
                .orElseThrow(() -> new PaymentException("Payment not found for Stripe intent: "
                        + request.getStripePaymentIntentId()));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return paymentMapper.toDTO(payment);
        }

        if (isValid) {
            payment.setGatewayPaymentId(request.getStripePaymentIntentId());
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setCompletedAt(LocalDateTime.now());
            payment = paymentRepository.save(payment);
            publishPaymentSuccessEvent(payment);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Payment verification failed");
            payment = paymentRepository.save(payment);
            publishPaymentFailedEvent(payment);
        }

        return paymentMapper.toDTO(payment);
    }

    @Override
    public PaymentDTO getPaymentById(Long paymentId) throws PaymentException {
        return paymentMapper.toDTO(paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("Payment not found with ID: " + paymentId)));
    }

    @Override
    public PaymentDTO getPaymentByTransactionId(String transactionId) throws PaymentException {
        return paymentMapper.toDTO(paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new PaymentException("Payment not found: " + transactionId)));
    }

    @Override
    public Page<PaymentDTO> getUserPayments(Long userId, Pageable pageable) throws PaymentException {
        if (!userRepository.existsById(userId))
            throw new PaymentException("User not found with ID: " + userId);
        return paymentRepository.findByUserIdAndActiveTrue(userId, pageable).map(paymentMapper::toDTO);
    }

    @Override
    public Page<PaymentDTO> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(paymentMapper::toDTO);
    }

    @Override
    public PaymentDTO cancelPayment(Long paymentId) throws PaymentException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("Payment not found with ID: " + paymentId));
        if (!payment.isPending())
            throw new PaymentException("Only pending payments can be cancelled");
        payment.setStatus(PaymentStatus.CANCELLED);
        return paymentMapper.toDTO(paymentRepository.save(payment));
    }

    @Override
    public PaymentInitiateResponse retryPayment(Long paymentId) throws PaymentException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("Payment not found with ID: " + paymentId));
        if (!payment.canRetry())
            throw new PaymentException("Payment cannot be retried");

        PaymentInitiateRequest request = new PaymentInitiateRequest();
        request.setUserId(payment.getUser().getId());
        request.setBookLoanId(payment.getBookLoan() != null ? payment.getBookLoan().getId() : null);
        request.setPaymentType(payment.getPaymentType());
        request.setGateway(payment.getGateway());
        request.setAmount(payment.getAmount());
        request.setCurrency(payment.getCurrency());
        request.setDescription(payment.getDescription());

        payment.setRetryCount(payment.getRetryCount() + 1);
        paymentRepository.save(payment);
        return initiatePayment(request);
    }

    @Override
    public RevenueStatisticsResponse getMonthlyRevenue() {
        List<Payment> payments = paymentRepository.findAll();
        int currentYear  = LocalDateTime.now().getYear();
        int currentMonth = LocalDateTime.now().getMonthValue();
        int lastMonth     = currentMonth == 1 ? 12 : currentMonth - 1;
        int lastMonthYear = currentMonth == 1 ? currentYear - 1 : currentYear;

        double thisMonth = payments.stream()
                .filter(Payment::isSuccessful)
                .filter(p -> p.getCreatedAt() != null
                        && p.getCreatedAt().getYear() == currentYear
                        && p.getCreatedAt().getMonthValue() == currentMonth)
                .mapToDouble(p -> p.getAmount().doubleValue() / 100.0).sum();

        double lastMonthRev = payments.stream()
                .filter(Payment::isSuccessful)
                .filter(p -> p.getCreatedAt() != null
                        && p.getCreatedAt().getYear() == lastMonthYear
                        && p.getCreatedAt().getMonthValue() == lastMonth)
                .mapToDouble(p -> p.getAmount().doubleValue() / 100.0).sum();

        double pctChange = lastMonthRev > 0
                ? ((thisMonth - lastMonthRev) / lastMonthRev) * 100.0
                : (thisMonth > 0 ? 100.0 : 0.0);

        String currency = payments.stream()
                .filter(Payment::isSuccessful).map(Payment::getCurrency)
                .filter(Objects::nonNull).findFirst().orElse("USD");

        RevenueStatisticsResponse res = new RevenueStatisticsResponse();
        res.setMonthlyRevenue(thisMonth);
        res.setLastMonthRevenue(lastMonthRev);
        res.setRevenuePercentageChange(pctChange);
        res.setCurrency(currency);
        res.setYear(currentYear);
        res.setMonth(currentMonth);
        return res;
    }

    private void publishPaymentInitiatedEvent(Payment p, String checkoutUrl) {
        paymentEventPublisher.publishPaymentInitiated(PaymentInitiatedEvent.builder()
                .paymentId(p.getId()).userId(p.getUser().getId())
                .paymentType(p.getPaymentType()).gateway(p.getGateway())
                .amount(p.getAmount()).currency(p.getCurrency())
                .subscriptionId(p.getSubscription() != null ? p.getSubscription().getId() : null)
                .fineId(p.getFine() != null ? p.getFine().getId() : null)
                .bookLoanId(p.getBookLoan() != null ? p.getBookLoan().getId() : null)
                .transactionId(p.getTransactionId()).initiatedAt(p.getInitiatedAt())
                .description(p.getDescription()).checkoutUrl(checkoutUrl)
                .userEmail(p.getUser().getEmail()).userName(p.getUser().getFullName())
                .build());
    }

    private void publishPaymentSuccessEvent(Payment p) {
        paymentEventPublisher.publishPaymentSuccess(PaymentSuccessEvent.builder()
                .paymentId(p.getId()).userId(p.getUser().getId())
                .paymentType(p.getPaymentType()).amount(p.getAmount()).currency(p.getCurrency())
                .subscriptionId(p.getSubscription() != null ? p.getSubscription().getId() : null)
                .fineId(p.getFine() != null ? p.getFine().getId() : null)
                .bookLoanId(p.getBookLoan() != null ? p.getBookLoan().getId() : null)
                .gatewayPaymentId(p.getGatewayPaymentId()).transactionId(p.getTransactionId())
                .completedAt(p.getCompletedAt()).description(p.getDescription())
                .build());
    }

    private void publishPaymentFailedEvent(Payment p) {
        paymentEventPublisher.publishPaymentFailed(PaymentFailedEvent.builder()
                .paymentId(p.getId()).userId(p.getUser().getId())
                .paymentType(p.getPaymentType()).amount(p.getAmount()).currency(p.getCurrency())
                .subscriptionId(p.getSubscription() != null ? p.getSubscription().getId() : null)
                .fineId(p.getFine() != null ? p.getFine().getId() : null)
                .bookLoanId(p.getBookLoan() != null ? p.getBookLoan().getId() : null)
                .failureReason(p.getFailureReason()).gatewayPaymentId(p.getGatewayPaymentId())
                .transactionId(p.getTransactionId()).failedAt(LocalDateTime.now())
                .description(p.getDescription())
                .userEmail(p.getUser().getEmail()).userName(p.getUser().getFullName())
                .build());
    }
}
