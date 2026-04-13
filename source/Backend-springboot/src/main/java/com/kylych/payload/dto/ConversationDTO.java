package com.kylych.payload.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConversationDTO {
    private UserSummaryDTO partner;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}
