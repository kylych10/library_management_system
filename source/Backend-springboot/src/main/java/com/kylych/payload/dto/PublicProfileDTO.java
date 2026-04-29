package com.kylych.payload.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PublicProfileDTO {
    private Long id;
    private String fullName;
    private String profileImage;
    private String phone;
    private LocalDateTime memberSince;
    private LocalDateTime lastLogin;
    private Boolean verified;

    // Exchange reputation
    private Double reputationScore;
    private Integer totalExchanges;
    private Integer totalBorrows;
    private Integer penaltyPoints;
    private Boolean blockedFromExchange;
}
