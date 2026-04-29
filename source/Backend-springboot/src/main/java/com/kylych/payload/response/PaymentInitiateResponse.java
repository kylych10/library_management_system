package com.kylych.payload.response;

import com.kylych.domain.PaymentGateway;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentInitiateResponse {
    private Long paymentId;
    private PaymentGateway gateway;
    private String transactionId;
    private Long amount;
    private String currency;
    private String description;
    private String checkoutUrl;
    private String message;
    private Boolean success;
}
