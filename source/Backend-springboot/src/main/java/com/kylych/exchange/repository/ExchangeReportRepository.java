package com.kylych.exchange.repository;

import com.kylych.exchange.domain.ExchangeReportStatus;
import com.kylych.exchange.model.ExchangeReport;
import com.kylych.modal.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExchangeReportRepository extends JpaRepository<ExchangeReport, Long> {
    Page<ExchangeReport> findByStatus(ExchangeReportStatus status, Pageable pageable);
    List<ExchangeReport> findByReporter(User reporter);
    List<ExchangeReport> findByReportedUser(User reportedUser);
}
