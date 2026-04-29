package com.kylych.exchange.service;

import com.kylych.exchange.domain.ExchangeBorrowStatus;
import com.kylych.exchange.domain.ExchangeBookStatus;
import com.kylych.exchange.domain.ExchangeDepositStatus;
import com.kylych.exchange.dto.ExchangeBorrowRecordDTO;
import com.kylych.exchange.dto.ExchangeRatingRequest;
import com.kylych.exchange.model.ExchangeBorrowRecord;
import com.kylych.exchange.model.ExchangeDeposit;
import com.kylych.exchange.model.ExchangeRequest;
import com.kylych.exchange.repository.ExchangeBorrowRecordRepository;
import com.kylych.exchange.repository.ExchangeBookRepository;
import com.kylych.exchange.repository.ExchangeDepositRepository;
import com.kylych.modal.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExchangeBorrowService {

    private final ExchangeBorrowRecordRepository borrowRepository;
    private final ExchangeBookRepository bookRepository;
    private final ExchangeReputationService reputationService;
    private final ExchangeDepositRepository depositRepository;

    @Transactional
    public ExchangeBorrowRecord createBorrowRecord(ExchangeRequest request) {
        User borrower = request.getRequester();
        long depositAmount = ExchangeReputationService.DEFAULT_DEPOSIT;

        // Lock deposit from borrower's balance (throws if insufficient)
        reputationService.lockDeposit(borrower, depositAmount);

        var book = request.getBook();
        book.setStatus(ExchangeBookStatus.BORROWED);
        bookRepository.save(book);

        LocalDate dueDate = LocalDate.now().plusDays(book.getBorrowDurationDays());
        ExchangeBorrowRecord record = ExchangeBorrowRecord.builder()
                .exchangeRequest(request)
                .borrower(borrower)
                .lender(book.getOwner())
                .book(book)
                .dueDate(dueDate)
                .status(ExchangeBorrowStatus.ACTIVE)
                .isOverdue(false)
                .penaltyApplied(false)
                .build();
        record = borrowRepository.save(record);

        // Create deposit record
        ExchangeDeposit deposit = ExchangeDeposit.builder()
                .borrowRecord(record)
                .amount(depositAmount)
                .status(ExchangeDepositStatus.LOCKED)
                .build();
        depositRepository.save(deposit);

        return record;
    }

    @Transactional
    public ExchangeBorrowRecordDTO returnBook(User borrower, Long recordId) {
        ExchangeBorrowRecord record = findAndVerifyBorrower(recordId, borrower);
        if (record.getStatus() != ExchangeBorrowStatus.ACTIVE && record.getStatus() != ExchangeBorrowStatus.OVERDUE) {
            throw new IllegalStateException("This borrow record is not active.");
        }
        record.setStatus(ExchangeBorrowStatus.RETURNED);
        record.setReturnedAt(LocalDateTime.now());

        // Relist book
        var book = record.getBook();
        book.setStatus(ExchangeBookStatus.AVAILABLE);
        bookRepository.save(book);

        // Release deposit back to borrower
        depositRepository.findByBorrowRecord(record).ifPresent(dep -> {
            dep.setStatus(ExchangeDepositStatus.RELEASED);
            dep.setResolvedAt(LocalDateTime.now());
            depositRepository.save(dep);
            reputationService.releaseDeposit(borrower, dep.getAmount());
        });

        // Track reputation stats
        reputationService.recordSuccessfulBorrow(borrower);
        reputationService.recordSuccessfulExchange(record.getLender());

        return toDTO(borrowRepository.save(record));
    }

    @Transactional
    public ExchangeBorrowRecordDTO rateBorrower(User lender, Long recordId, ExchangeRatingRequest req) {
        ExchangeBorrowRecord record = borrowRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Record not found: " + recordId));
        if (!record.getLender().getId().equals(lender.getId())) {
            throw new IllegalStateException("Only the lender can rate the borrower.");
        }
        if (record.getStatus() != ExchangeBorrowStatus.RETURNED) {
            throw new IllegalStateException("Book must be returned before rating.");
        }
        if (record.getLenderRating() != null) {
            throw new IllegalStateException("You have already rated this borrower.");
        }
        record.setLenderRating(req.getRating());
        record.setLenderComment(req.getComment());
        reputationService.applyRating(record.getBorrower(), req.getRating());
        return toDTO(borrowRepository.save(record));
    }

    @Transactional
    public ExchangeBorrowRecordDTO rateLender(User borrower, Long recordId, ExchangeRatingRequest req) {
        ExchangeBorrowRecord record = findAndVerifyBorrower(recordId, borrower);
        if (record.getStatus() != ExchangeBorrowStatus.RETURNED) {
            throw new IllegalStateException("Book must be returned before rating.");
        }
        if (record.getBorrowerRating() != null) {
            throw new IllegalStateException("You have already rated this lender.");
        }
        record.setBorrowerRating(req.getRating());
        record.setBorrowerComment(req.getComment());
        reputationService.applyRating(record.getLender(), req.getRating());
        return toDTO(borrowRepository.save(record));
    }

    @Transactional(readOnly = true)
    public List<ExchangeBorrowRecordDTO> getMyBorrows(User user) {
        return borrowRepository.findByBorrower(user).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExchangeBorrowRecordDTO> getMyLends(User user) {
        return borrowRepository.findByLender(user).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    private ExchangeBorrowRecord findAndVerifyBorrower(Long recordId, User borrower) {
        ExchangeBorrowRecord record = borrowRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Record not found: " + recordId));
        if (!record.getBorrower().getId().equals(borrower.getId())) {
            throw new IllegalStateException("You are not the borrower of this record.");
        }
        return record;
    }

    public ExchangeBorrowRecordDTO toDTO(ExchangeBorrowRecord r) {
        return ExchangeBorrowRecordDTO.builder()
                .id(r.getId())
                .exchangeRequestId(r.getExchangeRequest().getId())
                .borrowerId(r.getBorrower().getId())
                .borrowerName(r.getBorrower().getFullName())
                .borrowerProfileImage(r.getBorrower().getProfileImage())
                .lenderId(r.getLender().getId())
                .lenderName(r.getLender().getFullName())
                .lenderProfileImage(r.getLender().getProfileImage())
                .bookId(r.getBook().getId())
                .bookTitle(r.getBook().getTitle())
                .bookAuthor(r.getBook().getAuthor())
                .bookCoverImageUrl(r.getBook().getCoverImageUrl())
                .dueDate(r.getDueDate())
                .returnedAt(r.getReturnedAt())
                .status(r.getStatus())
                .borrowerRating(r.getBorrowerRating())
                .borrowerComment(r.getBorrowerComment())
                .lenderRating(r.getLenderRating())
                .lenderComment(r.getLenderComment())
                .isOverdue(r.getIsOverdue())
                .penaltyApplied(r.getPenaltyApplied())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
