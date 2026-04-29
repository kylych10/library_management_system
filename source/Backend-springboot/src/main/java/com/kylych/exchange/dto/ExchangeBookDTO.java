package com.kylych.exchange.dto;

import com.kylych.exchange.domain.BookCondition;
import com.kylych.exchange.domain.ExchangeBookStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ExchangeBookDTO {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String ownerProfileImage;
    private Double ownerReputationScore;
    private String title;
    private String author;
    private String description;
    private BookCondition condition;
    private String coverImageUrl;
    private ExchangeBookStatus status;
    private String isbn;
    private String genre;
    private Integer borrowDurationDays;
    private LocalDateTime createdAt;
}
