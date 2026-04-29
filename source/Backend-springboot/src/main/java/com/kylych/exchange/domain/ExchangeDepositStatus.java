package com.kylych.exchange.domain;

public enum ExchangeDepositStatus {
    LOCKED,     // held while book is borrowed
    RELEASED,   // returned to borrower after successful return
    FORFEITED   // kept by system after overdue/loss
}
