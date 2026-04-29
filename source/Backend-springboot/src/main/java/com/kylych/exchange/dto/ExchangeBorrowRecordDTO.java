package com.kylych.exchange.dto;

import com.kylych.exchange.domain.ExchangeBorrowStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class ExchangeBorrowRecordDTO {
    private Long id;
    private Long exchangeRequestId;
    private Long borrowerId;
    private String borrowerName;
    private String borrowerProfileImage;
    private Long lenderId;
    private String lenderName;
    private String lenderProfileImage;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookCoverImageUrl;
    private LocalDate dueDate;
    private LocalDateTime returnedAt;
    private ExchangeBorrowStatus status;
    private Integer borrowerRating;
    private String borrowerComment;
    private Integer lenderRating;
    private String lenderComment;
    private Boolean isOverdue;
    private Boolean penaltyApplied;
    private LocalDateTime createdAt;
}
