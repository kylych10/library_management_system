package com.kylych.exchange.service;

import com.kylych.exchange.domain.ExchangeBookStatus;
import com.kylych.exchange.dto.CreateExchangeBookRequest;
import com.kylych.exchange.dto.ExchangeBookDTO;
import com.kylych.exchange.model.ExchangeBook;
import com.kylych.exchange.domain.ExchangeBorrowStatus;
import com.kylych.exchange.domain.ExchangeRequestStatus;
import com.kylych.exchange.model.ExchangeBorrowRecord;
import com.kylych.exchange.model.ExchangeRequest;
import com.kylych.exchange.repository.ExchangeBorrowRecordRepository;
import com.kylych.exchange.repository.ExchangeBookRepository;
import com.kylych.exchange.repository.ExchangeRequestRepository;

import java.time.LocalDateTime;
import com.kylych.modal.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExchangeBookService {

    private final ExchangeBookRepository bookRepository;
    private final ExchangeReputationService reputationService;
    private final ExchangeRequestRepository requestRepository;
    private final ExchangeBorrowRecordRepository borrowRecordRepository;

    @Transactional
    public ExchangeBookDTO createBook(User owner, CreateExchangeBookRequest req) {
        ExchangeBook book = ExchangeBook.builder()
                .owner(owner)
                .title(req.getTitle())
                .author(req.getAuthor())
                .description(req.getDescription())
                .condition(req.getCondition())
                .coverImageUrl(req.getCoverImageUrl())
                .isbn(req.getIsbn())
                .genre(req.getGenre())
                .borrowDurationDays(req.getBorrowDurationDays() != null ? req.getBorrowDurationDays() : 14)
                .status(ExchangeBookStatus.AVAILABLE)
                .build();
        return toDTO(bookRepository.save(book));
    }

    public Page<ExchangeBookDTO> getMarketplace(User user, String q, String condition,
                                                 String sortBy, String sortDir, int page, int size) {
        Sort.Direction dir = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = switch (sortBy != null ? sortBy : "createdAt") {
            case "title"  -> "title";
            case "author" -> "author";
            default       -> "createdAt";
        };
        PageRequest pageable = PageRequest.of(page, size, Sort.by(dir, sortField));
        com.kylych.exchange.domain.BookCondition cond = null;
        if (condition != null && !condition.isBlank() && !condition.equals("ALL")) {
            try { cond = com.kylych.exchange.domain.BookCondition.valueOf(condition); } catch (Exception ignored) {}
        }
        return bookRepository.findMarketplaceFiltered(user, q, cond, pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<ExchangeBookDTO> getMyBooks(User owner) {
        return bookRepository.findByOwner(owner).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ExchangeBookDTO updateBook(Long bookId, User owner, CreateExchangeBookRequest req) {
        ExchangeBook book = findAndVerifyOwner(bookId, owner);
        if (book.getStatus() != ExchangeBookStatus.AVAILABLE) {
            throw new IllegalStateException("Only available books can be edited.");
        }
        book.setTitle(req.getTitle());
        book.setAuthor(req.getAuthor());
        book.setDescription(req.getDescription());
        book.setCondition(req.getCondition());
        book.setCoverImageUrl(req.getCoverImageUrl());
        book.setIsbn(req.getIsbn());
        book.setGenre(req.getGenre());
        if (req.getBorrowDurationDays() != null) book.setBorrowDurationDays(req.getBorrowDurationDays());
        return toDTO(bookRepository.save(book));
    }

    @Transactional
    public void toggleAvailability(Long bookId, User owner) {
        ExchangeBook book = findAndVerifyOwner(bookId, owner);

        // Cancel any pending requests
        requestRepository.findByBookAndStatus(book, ExchangeRequestStatus.PENDING)
                .forEach(r -> { r.setStatus(ExchangeRequestStatus.CANCELLED); requestRepository.save(r); });

        // Close any active borrow records (force-close if owner wants to reset)
        borrowRecordRepository.findByBook(book).stream()
                .filter(r -> r.getStatus() == ExchangeBorrowStatus.ACTIVE
                          || r.getStatus() == ExchangeBorrowStatus.OVERDUE)
                .forEach(r -> {
                    r.setStatus(ExchangeBorrowStatus.RETURNED);
                    r.setReturnedAt(LocalDateTime.now());
                    borrowRecordRepository.save(r);
                });

        // AVAILABLE → UNAVAILABLE; everything else → AVAILABLE
        book.setStatus(book.getStatus() == ExchangeBookStatus.AVAILABLE
                ? ExchangeBookStatus.UNAVAILABLE
                : ExchangeBookStatus.AVAILABLE);
        bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long bookId, User owner) {
        ExchangeBook book = findAndVerifyOwner(bookId, owner);
        if (book.getStatus() == ExchangeBookStatus.BORROWED || book.getStatus() == ExchangeBookStatus.REQUESTED) {
            throw new IllegalStateException("Cannot delete a book with active requests or borrows.");
        }
        bookRepository.delete(book);
    }

    public long getMyBalance(User user) {
        return reputationService.getBalance(user);
    }

    public ExchangeBook findById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exchange book not found: " + id));
    }

    private ExchangeBook findAndVerifyOwner(Long bookId, User owner) {
        ExchangeBook book = findById(bookId);
        if (!book.getOwner().getId().equals(owner.getId())) {
            throw new IllegalStateException("You are not the owner of this book.");
        }
        return book;
    }

    public ExchangeBookDTO toDTO(ExchangeBook book) {
        double score = reputationService.getReputationScore(book.getOwner());
        return ExchangeBookDTO.builder()
                .id(book.getId())
                .ownerId(book.getOwner().getId())
                .ownerName(book.getOwner().getFullName())
                .ownerProfileImage(book.getOwner().getProfileImage())
                .ownerReputationScore(score)
                .title(book.getTitle())
                .author(book.getAuthor())
                .description(book.getDescription())
                .condition(book.getCondition())
                .coverImageUrl(book.getCoverImageUrl())
                .status(book.getStatus())
                .isbn(book.getIsbn())
                .genre(book.getGenre())
                .borrowDurationDays(book.getBorrowDurationDays())
                .createdAt(book.getCreatedAt())
                .build();
    }
}
