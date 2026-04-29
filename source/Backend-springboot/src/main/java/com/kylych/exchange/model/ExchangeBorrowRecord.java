package com.kylych.exchange.model;

import com.kylych.exchange.domain.ExchangeBorrowStatus;
import com.kylych.modal.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_borrow_records", indexes = {
    @Index(name = "idx_ex_borrow_borrower", columnList = "borrower_id"),
    @Index(name = "idx_ex_borrow_lender", columnList = "lender_id"),
    @Index(name = "idx_ex_borrow_status", columnList = "status"),
    @Index(name = "idx_ex_borrow_due", columnList = "due_date")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExchangeBorrowRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exchange_request_id", nullable = false, unique = true)
    private ExchangeRequest exchangeRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lender_id", nullable = false)
    private User lender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private ExchangeBook book;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExchangeBorrowStatus status = ExchangeBorrowStatus.ACTIVE;

    // Rating the borrower gives the lender (1–5)
    @Column(name = "borrower_rating")
    private Integer borrowerRating;

    @Column(name = "borrower_comment", length = 500)
    private String borrowerComment;

    // Rating the lender gives the borrower (1–5)
    @Column(name = "lender_rating")
    private Integer lenderRating;

    @Column(name = "lender_comment", length = 500)
    private String lenderComment;

    @Column(name = "is_overdue", nullable = false)
    private Boolean isOverdue = false;

    @Column(name = "penalty_applied", nullable = false)
    private Boolean penaltyApplied = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
