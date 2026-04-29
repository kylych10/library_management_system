package com.kylych.exchange.repository;

import com.kylych.exchange.domain.ExchangeBorrowStatus;
import com.kylych.exchange.model.ExchangeBorrowRecord;
import com.kylych.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExchangeBorrowRecordRepository extends JpaRepository<ExchangeBorrowRecord, Long> {

    List<ExchangeBorrowRecord> findByBorrower(User borrower);

    List<ExchangeBorrowRecord> findByLender(User lender);

    List<ExchangeBorrowRecord> findByBorrowerAndStatus(User borrower, ExchangeBorrowStatus status);

    Optional<ExchangeBorrowRecord> findByExchangeRequestId(Long requestId);

    List<ExchangeBorrowRecord> findByBook(com.kylych.exchange.model.ExchangeBook book);

    @Query("SELECT r FROM ExchangeBorrowRecord r WHERE r.status = 'ACTIVE' AND r.dueDate < :today")
    List<ExchangeBorrowRecord> findOverdue(@Param("today") LocalDate today);

    @Query("SELECT r FROM ExchangeBorrowRecord r WHERE (r.borrower = :user OR r.lender = :user) AND r.status = :status")
    List<ExchangeBorrowRecord> findByUserAndStatus(@Param("user") User user,
                                                    @Param("status") ExchangeBorrowStatus status);
}
