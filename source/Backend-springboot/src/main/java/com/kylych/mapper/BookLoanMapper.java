package com.kylych.mapper;

import com.kylych.domain.FineStatus;
import com.kylych.modal.BookLoan;
import com.kylych.modal.Fine;

import com.kylych.payload.dto.BookLoanDTO;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

/**
 * Mapper for converting between BookLoan entity and BookLoanDTO
 */
@Component
public class BookLoanMapper {

    /**
     * Convert BookLoan entity to BookLoanDTO
     */
    public BookLoanDTO toDTO(BookLoan bookLoan) {
        if (bookLoan == null) {
            return null;
        }

        BookLoanDTO dto = new BookLoanDTO();
        dto.setId(bookLoan.getId());

        // User information
        if (bookLoan.getUser() != null) {
            dto.setUserId(bookLoan.getUser().getId());
            dto.setUserName(bookLoan.getUser().getFullName());
            dto.setUserEmail(bookLoan.getUser().getEmail());
        }

        // Book information
        if (bookLoan.getBook() != null) {
            dto.setBookId(bookLoan.getBook().getId());
            dto.setBookTitle(bookLoan.getBook().getTitle());
            dto.setBookIsbn(bookLoan.getBook().getIsbn());
            dto.setBookAuthor(bookLoan.getBook().getAuthor());
            dto.setBookCoverImage(bookLoan.getBook().getCoverImageUrl());
        }

        // Book loan details
        dto.setType(bookLoan.getType());
        dto.setStatus(bookLoan.getStatus());
        dto.setCheckoutDate(bookLoan.getCheckoutDate());
        dto.setDueDate(bookLoan.getDueDate());
        dto.setRemainingDays(
                    ChronoUnit.DAYS.between(
                            LocalDate.now(),
                    bookLoan.getDueDate()
                )
        );
        dto.setReturnDate(bookLoan.getReturnDate());
        dto.setRenewalCount(bookLoan.getRenewalCount());
        dto.setMaxRenewals(bookLoan.getMaxRenewals());

        dto.setNotes(bookLoan.getNotes());
        dto.setIsOverdue(bookLoan.getIsOverdue());
        dto.setOverdueDays(bookLoan.getOverdueDays());
        dto.setCreatedAt(bookLoan.getCreatedAt());
        dto.setUpdatedAt(bookLoan.getUpdatedAt());

        // Populate fine info from associated Fine records
        List<Fine> fines = bookLoan.getFines();
        if (fines != null && !fines.isEmpty()) {
            // Pick the most recent non-waived fine
            Fine activeFine = fines.stream()
                    .filter(f -> f.getStatus() != FineStatus.WAIVED)
                    .max(Comparator.comparing(f -> f.getCreatedAt() != null ? f.getCreatedAt() : java.time.LocalDateTime.MIN))
                    .orElse(null);
            if (activeFine != null) {
                dto.setFineId(activeFine.getId());
                dto.setFineAmount(BigDecimal.valueOf(activeFine.getAmount()));
                dto.setFinePaid(activeFine.getStatus() == FineStatus.PAID);
            }
        }

        return dto;
    }
}
