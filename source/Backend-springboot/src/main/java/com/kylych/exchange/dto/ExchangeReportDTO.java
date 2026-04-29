package com.kylych.exchange.dto;

import com.kylych.exchange.domain.ExchangeReportReason;
import com.kylych.exchange.domain.ExchangeReportStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ExchangeReportDTO {
    private Long id;
    private Long reporterId;
    private String reporterName;
    private Long reportedUserId;
    private String reportedUserName;
    private Long borrowRecordId;
    private ExchangeReportReason reason;
    private String description;
    private ExchangeReportStatus status;
    private String adminNotes;
    private LocalDateTime createdAt;
}
