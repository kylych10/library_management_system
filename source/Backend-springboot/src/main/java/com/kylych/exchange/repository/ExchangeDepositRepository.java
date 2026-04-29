package com.kylych.exchange.repository;

import com.kylych.exchange.model.ExchangeBorrowRecord;
import com.kylych.exchange.model.ExchangeDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExchangeDepositRepository extends JpaRepository<ExchangeDeposit, Long> {
    Optional<ExchangeDeposit> findByBorrowRecord(ExchangeBorrowRecord record);
}
