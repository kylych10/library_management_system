package com.kylych.payload.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private UserSummaryDTO sender;
    private UserSummaryDTO receiver;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
