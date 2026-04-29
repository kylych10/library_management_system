package com.kylych.exchange.model;

import com.kylych.exchange.domain.BookCondition;
import com.kylych.exchange.domain.ExchangeBookStatus;
import com.kylych.modal.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_books", indexes = {
    @Index(name = "idx_ex_book_owner", columnList = "owner_id"),
    @Index(name = "idx_ex_book_status", columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExchangeBook {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "book_condition", nullable = false, length = 20)
    private BookCondition condition;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExchangeBookStatus status = ExchangeBookStatus.AVAILABLE;

    @Column(length = 20)
    private String isbn;

    @Column(length = 100)
    private String genre;

    @Column(name = "borrow_duration_days", nullable = false)
    private Integer borrowDurationDays = 14;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
