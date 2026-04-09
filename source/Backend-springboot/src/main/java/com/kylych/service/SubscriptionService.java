package com.kylych.service;

import com.kylych.exception.PaymentException;
import com.kylych.exception.SubscriptionException;
import com.kylych.exception.UserException;
import com.kylych.payload.dto.SubscriptionDTO;
import com.kylych.payload.request.SubscribeRequest;
import com.kylych.payload.response.PaymentInitiateResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for subscription operations
 */
public interface SubscriptionService {

    /**
     * Create new subscription with payment
     */
    PaymentInitiateResponse subscribe(SubscribeRequest request) throws SubscriptionException, UserException, PaymentException;

    /**
     * Create and immediately activate a subscription without payment (dev/demo mode)
     */
    SubscriptionDTO subscribeFree(Long planId) throws SubscriptionException, UserException;

    /**
     * Get active subscription for user
     */
    SubscriptionDTO getUsersActiveSubscription(Long userId) throws SubscriptionException, UserException;

    /**
     * Get all subscriptions for user
     */
    List<SubscriptionDTO> getUserSubscriptions(Long userId) throws SubscriptionException, UserException;

    /**
     * Renew subscription
     */
    PaymentInitiateResponse renewSubscription(Long subscriptionId, SubscribeRequest request) throws SubscriptionException, UserException, PaymentException;

    /**
     * Cancel subscription
     */
    SubscriptionDTO cancelSubscription(Long subscriptionId, String reason) throws SubscriptionException;

    /**
     * Get subscription by ID
     */
    SubscriptionDTO getSubscriptionById(Long id) throws SubscriptionException;

    /**
     * Verify and activate subscription after successful payment
     */
    SubscriptionDTO activateSubscription(Long subscriptionId, Long paymentId) throws SubscriptionException;

    /**
     * Get all active subscriptions (Admin)
     */
    List<SubscriptionDTO> getAllActiveSubscriptions(Pageable pageable);

    /**
     * Deactivate expired subscriptions (Scheduler)
     */
    void deactivateExpiredSubscriptions();

    /**
     * Check if user has valid subscription
     */
    boolean hasValidSubscription(Long userId);
}
