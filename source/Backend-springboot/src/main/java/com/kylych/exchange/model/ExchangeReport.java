package com.kylych.exchange.model;

import com.kylych.exchange.domain.ExchangeReportReason;
import com.kylych.exchange.domain.ExchangeReportStatus;
import com.kylych.modal.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_reports", indexes = {
    @Index(name = "idx_ex_report_status", columnList = "status"),
    @Index(name = "idx_ex_report_reporter", columnList = "reporter_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExchangeReport {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id", nullable = false)
    private User reportedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_record_id")
    private ExchangeBorrowRecord borrowRecord;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExchangeReportReason reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExchangeReportStatus status = ExchangeReportStatus.PENDING;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
