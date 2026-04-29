package com.kylych.exchange.model;

import com.kylych.modal.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_reputations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserReputation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "reputation_score", nullable = false)
    private Double reputationScore = 5.0;

    @Column(name = "total_exchanges", nullable = false)
    private Integer totalExchanges = 0;

    @Column(name = "total_borrows", nullable = false)
    private Integer totalBorrows = 0;

    @Column(name = "penalty_points", nullable = false)
    private Integer penaltyPoints = 0;

    @Column(name = "blocked_from_exchange", nullable = false)
    private Boolean blockedFromExchange = false;

    // Virtual balance for deposits. New users get 1000 by default.
    @Column(name = "exchange_balance", nullable = false)
    private Long exchangeBalance = 1000L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
