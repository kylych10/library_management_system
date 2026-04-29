package com.kylych.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequest {
    private String stripePaymentIntentId;
    private String stripePaymentIntentStatus;
}
