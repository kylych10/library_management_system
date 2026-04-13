package com.kylych.payload.dto;

import com.kylych.domain.FriendshipStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FriendshipDTO {
    private Long id;
    private UserSummaryDTO requester;
    private UserSummaryDTO receiver;
    private FriendshipStatus status;
    private LocalDateTime createdAt;
}
