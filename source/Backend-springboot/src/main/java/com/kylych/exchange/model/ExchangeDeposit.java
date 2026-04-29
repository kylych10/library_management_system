package com.kylych.exchange.model;

import com.kylych.exchange.domain.ExchangeDepositStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_deposits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExchangeDeposit {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_record_id", nullable = false, unique = true)
    private ExchangeBorrowRecord borrowRecord;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExchangeDepositStatus status = ExchangeDepositStatus.LOCKED;

    @CreationTimestamp
    @Column(name = "locked_at", nullable = false, updatable = false)
    private LocalDateTime lockedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
