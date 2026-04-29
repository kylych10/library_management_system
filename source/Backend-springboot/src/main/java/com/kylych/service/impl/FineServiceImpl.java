package com.kylych.service.impl;

import com.kylych.domain.FineStatus;
import com.kylych.domain.FineType;
import com.kylych.domain.NotificationType;
import com.kylych.domain.PaymentGateway;
import com.kylych.domain.PaymentType;
import com.kylych.exception.FineException;
import com.kylych.exception.BookLoanException;
import com.kylych.exception.PaymentException;
import com.kylych.mapper.FineMapper;
import com.kylych.modal.BookLoan;
import com.kylych.modal.Fine;
import com.kylych.modal.User;
import com.kylych.payload.dto.FineDTO;
import com.kylych.payload.request.CreateFineRequest;
import com.kylych.payload.request.PaymentInitiateRequest;
import com.kylych.payload.request.WaiveFineRequest;
import com.kylych.payload.response.PageResponse;
import com.kylych.payload.response.PaymentInitiateResponse;
import com.kylych.repository.BookLoanRepository;
import com.kylych.repository.FineRepository;
import com.kylych.repository.PaymentRepository;
import com.kylych.repository.UserRepository;
import com.kylych.service.FineService;
import com.kylych.service.NotificationService;
import com.kylych.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of FineService interface.
 * Handles all business logic for fine operations.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class FineServiceImpl implements FineService {

    private final FineRepository fineRepository;
    private final BookLoanRepository bookLoanRepository;
    private final UserRepository userRepository;
    private final FineMapper fineMapper;
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    @Autowired @Lazy
    private NotificationService notificationService;


    // ==================== CREATE OPERATIONS ====================

    @Override
    public FineDTO createFine(CreateFineRequest createRequest) throws BookLoanException {
        // 1. Validate book loan exists
        BookLoan bookLoan = bookLoanRepository.findById(createRequest.getBookLoanId())
                .orElseThrow(() -> new BookLoanException(
                        "Book loan not found with id: " + createRequest.getBookLoanId()));

        // 2. Reuse existing non-waived fine if one already exists for this loan
        Fine fine = fineRepository.findByBookLoanId(bookLoan.getId()).stream()
                .filter(f -> f.getStatus() != FineStatus.WAIVED)
                .findFirst()
                .orElse(null);

        if (fine == null) {
            fine = Fine.builder()
                    .bookLoan(bookLoan)
                    .user(bookLoan.getUser())
                    .type(createRequest.getType())
                    .amount(createRequest.getAmount())
                    .amountPaid(0L)
                    .status(FineStatus.PENDING)
                    .reason(createRequest.getReason())
                    .notes(createRequest.getNotes())
                    .build();
        } else {
            fine.setType(createRequest.getType());
            fine.setAmount(createRequest.getAmount());
            fine.setAmountPaid(0L);
            fine.setStatus(FineStatus.PENDING);
            fine.setReason(createRequest.getReason());
            fine.setNotes(createRequest.getNotes());
            fine.setTransactionId(null);
            fine.setUpdatedAt(LocalDateTime.now());
        }

        // 3. Save and return
        Fine savedFine = fineRepository.save(fine);
        log.info("Upserted fine: {} for book loan: {}", savedFine.getId(), bookLoan.getId());

        // Notify the user about the fine
        try {
            String bookTitle = bookLoan.getBook() != null ? bookLoan.getBook().getTitle() : "Unknown Book";
            String amountStr = String.format("$%.2f", savedFine.getAmount() / 100.0);
            notificationService.createNotification(
                    savedFine.getUser(),
                    "Fine Added to Your Account",
                    "A fine of " + amountStr + " has been added for \"" + bookTitle + "\". Reason: " + (savedFine.getReason() != null ? savedFine.getReason() : savedFine.getType().name()),
                    NotificationType.FINE_NOTIFICATION,
                    savedFine.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to send fine creation notification for fine {}: {}", savedFine.getId(), e.getMessage());
        }

        return fineMapper.toDTO(savedFine);
    }






    // ==================== PAYMENT OPERATIONS ====================

    @Override
    public PaymentInitiateResponse payFineFully(Long fineId, String transactionId) throws FineException, PaymentException {
        // 1. Validate fine exists
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new FineException("Fine not found with id: " + fineId));

        // 2. Check if already paid
        if (fine.getStatus() == FineStatus.PAID) {
            throw new FineException("Fine is already fully paid");
        }

        if (fine.getStatus() == FineStatus.WAIVED) {
            throw new FineException("Fine has been waived and cannot be paid");
        }

        // 3. initiate payment
        User currentUser = getCurrentAuthenticatedUser();

        PaymentInitiateRequest context = PaymentInitiateRequest.builder()
                .userId(currentUser.getId())
                .fineId(fine.getId())
                .paymentType(PaymentType.FINE)
                .gateway(PaymentGateway.STRIPE)
                .amount(fine.getAmountOutstanding())
                .currency("INR")
                .description("Library fine payment for fine ID " + fine.getId())
                .build();

        // ✅ Delegate everything to PaymentService

        return paymentService.initiatePayment(context);
    }

    @Override
    @Transactional
    public FineDTO markFineAsPaidDirect(Long fineId) throws FineException {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new FineException("Fine not found with id: " + fineId));

        if (fine.getStatus() == FineStatus.PAID) {
            throw new FineException("Fine is already fully paid");
        }
        if (fine.getStatus() == FineStatus.WAIVED) {
            throw new FineException("Fine has been waived");
        }

        // Verify caller owns this fine (admins bypass this check)
        User caller = getCurrentAuthenticatedUser();
        boolean isAdmin = com.kylych.domain.UserRole.ROLE_ADMIN.equals(caller.getRole());
        if (!isAdmin && !fine.getUser().getId().equals(caller.getId())) {
            throw new FineException("You are not authorized to pay this fine");
        }

        fine.setAmountPaid(fine.getAmount());
        fine.setStatus(FineStatus.PAID);
        fine.setTransactionId("DIRECT_" + caller.getId() + "_" + fineId);
        fine.setUpdatedAt(LocalDateTime.now());

        Fine savedFine = fineRepository.save(fine);
        log.info("Fine {} marked as paid directly by user {}", fineId, caller.getId());

        // Notify the user their fine is paid
        try {
            String bookTitle = savedFine.getBookLoan() != null && savedFine.getBookLoan().getBook() != null
                    ? savedFine.getBookLoan().getBook().getTitle() : "Unknown Book";
            String amountStr = String.format("$%.2f", savedFine.getAmount() / 100.0);
            notificationService.createNotification(
                    savedFine.getUser(),
                    "Fine Marked as Paid",
                    "Your fine of " + amountStr + " for \"" + bookTitle + "\" has been marked as paid.",
                    NotificationType.FINE_NOTIFICATION,
                    savedFine.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to send direct fine paid notification for fine {}: {}", fineId, e.getMessage());
        }

        return fineMapper.toDTO(savedFine);
    }

    @Override
    @Transactional
    public void markFineAsPaid(Long fineId, Long amount, String transactionId) throws FineException {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new FineException(
                        "Fine not found with id: " + fineId));

        // Apply payment amount safely
        fine.applyPayment(amount);
        fine.setTransactionId(transactionId);
        fine.setStatus(FineStatus.PAID);
        fine.setUpdatedAt(LocalDateTime.now());

        Fine savedFine = fineRepository.save(fine);

        log.info("Fine {} marked as fully paid (txn: {})", fineId, transactionId);

        // Notify the user their fine payment was received
        try {
            String bookTitle = savedFine.getBookLoan() != null && savedFine.getBookLoan().getBook() != null
                    ? savedFine.getBookLoan().getBook().getTitle() : "Unknown Book";
            String amountStr = String.format("$%.2f", savedFine.getAmount() / 100.0);
            notificationService.createNotification(
                    savedFine.getUser(),
                    "Fine Payment Received",
                    "Your fine payment of " + amountStr + " for \"" + bookTitle + "\" has been received. Your account is now clear.",
                    NotificationType.FINE_NOTIFICATION,
                    savedFine.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to send fine paid notification for fine {}: {}", fineId, e.getMessage());
        }
    }


    // ==================== WAIVER OPERATIONS ====================

    @Override
    public FineDTO waiveFine(WaiveFineRequest waiveRequest) throws FineException {
        // 1. Validate fine exists
        Fine fine = fineRepository.findById(waiveRequest.getFineId())
                .orElseThrow(() -> new FineException("Fine not found with id: " + waiveRequest.getFineId()));

        // 2. Check if already waived or paid
        if (fine.getStatus() == FineStatus.WAIVED) {
            throw new FineException("Fine has already been waived");
        }

        if (fine.getStatus() == FineStatus.PAID) {
            throw new FineException("Fine has already been paid and cannot be waived");
        }

        // 3. Waive the fine
        User currentAdmin = getCurrentAuthenticatedUser();
        fine.waive(currentAdmin, waiveRequest.getReason());

        // 4. Save and return
        Fine savedFine = fineRepository.save(fine);
        log.info("Fine {} waived by admin: {}", fine.getId(), currentAdmin.getId());

        // Notify the user their fine was waived
        try {
            String bookTitle = savedFine.getBookLoan() != null && savedFine.getBookLoan().getBook() != null
                    ? savedFine.getBookLoan().getBook().getTitle() : "Unknown Book";
            String amountStr = String.format("$%.2f", savedFine.getAmount() / 100.0);
            String reason = waiveRequest.getReason() != null ? waiveRequest.getReason() : "No reason provided";
            notificationService.createNotification(
                    savedFine.getUser(),
                    "Fine Waived",
                    "Your fine of " + amountStr + " for \"" + bookTitle + "\" has been waived. Reason: " + reason,
                    NotificationType.FINE_NOTIFICATION,
                    savedFine.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to send fine waiver notification for fine {}: {}", savedFine.getId(), e.getMessage());
        }

        return fineMapper.toDTO(savedFine);
    }

    // ==================== QUERY OPERATIONS ====================

    @Override
    public FineDTO getFineById(Long fineId) throws FineException {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new FineException("Fine not found with id: " + fineId));
        return fineMapper.toDTO(fine);
    }

    @Override
    public List<FineDTO> getFinesByBookLoanId(Long bookLoanId) {
        List<Fine> fines = fineRepository.findByBookLoanId(bookLoanId);
        return fineMapper.toDTOList(fines);
    }

    @Override
    public List<FineDTO> getMyFines(FineStatus status, FineType type) {
        User currentUser = getCurrentAuthenticatedUser();
        List<Fine> fines;

        // Apply filters based on parameters
        if (status != null && type != null) {
            // Both filters
            fines = fineRepository.findByUserId(currentUser.getId()).stream()
                    .filter(f -> f.getStatus() == status && f.getType() == type)
                    .collect(Collectors.toList());
        } else if (status != null) {
            // Status filter only
            fines = fineRepository.findByUserId(currentUser.getId()).stream()
                    .filter(f -> f.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (type != null) {
            // Type filter only
            fines = fineRepository.findByUserIdAndType(currentUser.getId(), type);
        } else {
            // No filter - all fines for user
            fines = fineRepository.findByUserId(currentUser.getId());
        }

        return fineMapper.toDTOList(fineRepository.findByUserId(currentUser.getId()));
    }

    @Override
    public PageResponse<FineDTO> getAllFines(FineStatus status,
                                             FineType type,
                                             Long userId,
                                             int page,
                                             int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending());

        Page<Fine> finePage = fineRepository.findAllWithFilters(
                userId,
                status,
                type,
                pageable
        );
        return convertToPageResponse(finePage);
    }

    // ==================== AGGREGATION OPERATIONS ====================

    @Override
    public Long getMyTotalUnpaidFines() {
        User currentUser = getCurrentAuthenticatedUser();
        return getTotalUnpaidFinesByUserId(currentUser.getId());
    }

    @Override
    public Long getTotalUnpaidFinesByUserId(Long userId) {
        return fineRepository.getTotalUnpaidFinesByUserId(userId);
    }

    @Override
    public Long getTotalCollectedFines() {
        return fineRepository.getTotalCollectedFines();
    }

    @Override
    public Long getTotalOutstandingFines() {
        return fineRepository.getTotalOutstandingFines();
    }

    // ==================== VALIDATION OPERATIONS ====================

    @Override
    public boolean hasUnpaidFines(Long userId) {
        return fineRepository.hasUnpaidFines(userId);
    }

    @Override
    public void deleteFine(Long fineId) throws FineException {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new FineException("Fine not found with id: " + fineId));

        // Unlink any payment records referencing this fine to avoid FK constraint failure
        paymentRepository.findByFineId(fineId).forEach(payment -> {
            payment.setFine(null);
            paymentRepository.save(payment);
        });

        fineRepository.delete(fine);
        log.warn("Fine {} deleted", fineId);
    }




    // ==================== HELPER METHODS ====================

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Authenticated user not found");
        }
        return user;
    }

    private PageResponse<FineDTO> convertToPageResponse(Page<Fine> finePage) {
        List<FineDTO> fineDTOs = finePage.getContent()
                .stream()
                .map(fineMapper::toDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                fineDTOs,
                finePage.getNumber(),
                finePage.getSize(),
                finePage.getTotalElements(),
                finePage.getTotalPages(),
                finePage.isLast(),
                finePage.isFirst(),
                finePage.isEmpty()
        );
    }
}
