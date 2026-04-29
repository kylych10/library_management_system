package com.kylych.exchange.service;

import com.kylych.exchange.domain.ExchangeBorrowStatus;
import com.kylych.exchange.domain.ExchangeDepositStatus;
import com.kylych.exchange.model.ExchangeBorrowRecord;
import com.kylych.exchange.repository.ExchangeBorrowRecordRepository;
import com.kylych.exchange.repository.ExchangeDepositRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExchangeOverdueScheduler {

    private final ExchangeBorrowRecordRepository borrowRepository;
    private final ExchangeReputationService reputationService;
    private final ExchangeDepositRepository depositRepository;

    @Scheduled(cron = "0 30 2 * * ?")
    @Transactional
    public void checkOverdue() {
        List<ExchangeBorrowRecord> overdue = borrowRepository.findOverdue(LocalDate.now());
        for (ExchangeBorrowRecord record : overdue) {
            if (!record.getIsOverdue()) {
                record.setIsOverdue(true);
                record.setStatus(ExchangeBorrowStatus.OVERDUE);
                borrowRepository.save(record);
                log.info("Marked record {} as overdue", record.getId());
            }
            if (!record.getPenaltyApplied()) {
                // Apply reputation penalty
                reputationService.applyPenalty(record.getBorrower(), 2);

                // Forfeit deposit — borrower loses it, system keeps it
                depositRepository.findByBorrowRecord(record).ifPresent(dep -> {
                    if (dep.getStatus() == ExchangeDepositStatus.LOCKED) {
                        dep.setStatus(ExchangeDepositStatus.FORFEITED);
                        dep.setResolvedAt(LocalDateTime.now());
                        depositRepository.save(dep);
                        log.info("Forfeited deposit {} for overdue record {}", dep.getId(), record.getId());
                    }
                });

                record.setPenaltyApplied(true);
                borrowRepository.save(record);
            }
        }
        log.info("Exchange overdue check done. {} records processed.", overdue.size());
    }
}
