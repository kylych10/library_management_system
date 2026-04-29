package com.kylych.exchange.service;

import com.kylych.exchange.dto.UserReputationDTO;
import com.kylych.exchange.model.UserReputation;
import com.kylych.exchange.repository.UserReputationRepository;
import com.kylych.modal.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExchangeReputationService {

    private static final int PENALTY_BLOCK_THRESHOLD = 10;
    public static final long DEFAULT_DEPOSIT = 500L;
    public static final long STARTING_BALANCE = 1000L;

    private final UserReputationRepository reputationRepository;

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public UserReputation getOrCreate(User user) {
        return reputationRepository.findByUser(user).orElseGet(() -> {
            UserReputation rep = UserReputation.builder()
                    .user(user)
                    .reputationScore(5.0)
                    .totalExchanges(0)
                    .totalBorrows(0)
                    .penaltyPoints(0)
                    .blockedFromExchange(false)
                    .exchangeBalance(STARTING_BALANCE)
                    .build();
            return reputationRepository.save(rep);
        });
    }

    public double getReputationScore(User user) {
        return reputationRepository.findByUser(user)
                .map(UserReputation::getReputationScore)
                .orElse(5.0);
    }

    // ── Balance ───────────────────────────────────────────────────────────────

    @Transactional
    public void lockDeposit(User user, long amount) {
        UserReputation rep = getOrCreate(user);
        if (rep.getExchangeBalance() < amount) {
            throw new IllegalStateException(
                "Insufficient balance. You need " + amount + " coins to borrow. Your balance: " + rep.getExchangeBalance());
        }
        rep.setExchangeBalance(rep.getExchangeBalance() - amount);
        reputationRepository.save(rep);
    }

    @Transactional
    public void releaseDeposit(User user, long amount) {
        UserReputation rep = getOrCreate(user);
        rep.setExchangeBalance(rep.getExchangeBalance() + amount);
        reputationRepository.save(rep);
    }

    @Transactional
    public void grantBalance(User user, long amount) {
        UserReputation rep = getOrCreate(user);
        rep.setExchangeBalance(rep.getExchangeBalance() + amount);
        reputationRepository.save(rep);
    }

    public long getBalance(User user) {
        return reputationRepository.findByUser(user)
                .map(UserReputation::getExchangeBalance)
                .orElse(STARTING_BALANCE);
    }

    // ── Stats & Reputation ────────────────────────────────────────────────────

    @Transactional
    public void recordSuccessfulExchange(User lender) {
        UserReputation rep = getOrCreate(lender);
        rep.setTotalExchanges(rep.getTotalExchanges() + 1);
        reputationRepository.save(rep);
    }

    @Transactional
    public void recordSuccessfulBorrow(User borrower) {
        UserReputation rep = getOrCreate(borrower);
        rep.setTotalBorrows(rep.getTotalBorrows() + 1);
        reputationRepository.save(rep);
    }

    @Transactional
    public void applyRating(User user, int rating) {
        UserReputation rep = getOrCreate(user);
        double updated = rep.getReputationScore() * 0.8 + rating * 0.2;
        rep.setReputationScore(Math.round(updated * 10.0) / 10.0);
        reputationRepository.save(rep);
    }

    @Transactional
    public void applyPenalty(User user, int points) {
        UserReputation rep = getOrCreate(user);
        rep.setPenaltyPoints(rep.getPenaltyPoints() + points);
        double penalized = Math.max(1.0, rep.getReputationScore() - (points * 0.5));
        rep.setReputationScore(Math.round(penalized * 10.0) / 10.0);
        if (rep.getPenaltyPoints() >= PENALTY_BLOCK_THRESHOLD) {
            rep.setBlockedFromExchange(true);
        }
        reputationRepository.save(rep);
    }

    @Transactional
    public void unblockUser(User user) {
        UserReputation rep = getOrCreate(user);
        rep.setBlockedFromExchange(false);
        rep.setPenaltyPoints(0);
        reputationRepository.save(rep);
    }

    public boolean isBlocked(User user) {
        return reputationRepository.findByUser(user)
                .map(UserReputation::getBlockedFromExchange)
                .orElse(false);
    }

    public UserReputationDTO toDTO(UserReputation rep) {
        return UserReputationDTO.builder()
                .userId(rep.getUser().getId())
                .userName(rep.getUser().getFullName())
                .reputationScore(rep.getReputationScore())
                .totalExchanges(rep.getTotalExchanges())
                .totalBorrows(rep.getTotalBorrows())
                .penaltyPoints(rep.getPenaltyPoints())
                .blockedFromExchange(rep.getBlockedFromExchange())
                .exchangeBalance(rep.getExchangeBalance())
                .build();
    }
}
