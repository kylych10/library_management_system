package com.kylych.exchange.dto;

import com.kylych.exchange.domain.ExchangeRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ExchangeRequestDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookCoverImageUrl;
    private Long requesterId;
    private String requesterName;
    private String requesterProfileImage;
    private Double requesterReputationScore;
    private String message;
    private ExchangeRequestStatus status;
    private LocalDateTime createdAt;
}
