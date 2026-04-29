package com.kylych.exchange.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class UserReputationDTO {
    private Long userId;
    private String userName;
    private Double reputationScore;
    private Integer totalExchanges;
    private Integer totalBorrows;
    private Integer penaltyPoints;
    private Boolean blockedFromExchange;
    private Long exchangeBalance;
}
