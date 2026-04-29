package com.kylych.exchange.dto;

import com.kylych.exchange.domain.ExchangeReportReason;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExchangeReportRequest {
    @NotNull private Long borrowRecordId;
    @NotNull private Long reportedUserId;
    @NotNull private ExchangeReportReason reason;
    @NotBlank private String description;
}
