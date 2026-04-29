package com.kylych.exchange.service;

import com.kylych.exchange.domain.ExchangeBookStatus;
import com.kylych.exchange.domain.ExchangeRequestStatus;
import com.kylych.exchange.dto.ExchangeRequestDTO;
import com.kylych.exchange.model.ExchangeBook;
import com.kylych.exchange.model.ExchangeRequest;
import com.kylych.exchange.repository.ExchangeBookRepository;
import com.kylych.exchange.repository.ExchangeRequestRepository;
import com.kylych.modal.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExchangeRequestService {

    private static final int MAX_ACTIVE_REQUESTS = 5;

    private final ExchangeRequestRepository requestRepository;
    private final ExchangeBookRepository bookRepository;
    private final ExchangeReputationService reputationService;
    private final ExchangeBorrowService borrowService;

    @Transactional
    public ExchangeRequestDTO sendRequest(User requester, Long bookId, String message) {
        ExchangeBook book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));
        if (book.getOwner().getId().equals(requester.getId())) {
            throw new IllegalStateException("You cannot request your own book.");
        }
        if (book.getStatus() != ExchangeBookStatus.AVAILABLE) {
            throw new IllegalStateException("This book is not available for exchange.");
        }
        if (requestRepository.existsByBookAndRequesterAndStatus(book, requester, ExchangeRequestStatus.PENDING)) {
            throw new IllegalStateException("You already have a pending request for this book.");
        }
        long active = requestRepository.countByRequesterAndStatus(requester, ExchangeRequestStatus.PENDING);
        if (active >= MAX_ACTIVE_REQUESTS) {
            throw new IllegalStateException("You have reached the maximum of " + MAX_ACTIVE_REQUESTS + " pending requests.");
        }
        ExchangeRequest request = ExchangeRequest.builder()
                .book(book)
                .requester(requester)
                .message(message)
                .status(ExchangeRequestStatus.PENDING)
                .build();
        // Mark book as requested
        book.setStatus(ExchangeBookStatus.REQUESTED);
        bookRepository.save(book);
        return toDTO(requestRepository.save(request));
    }

    @Transactional
    public ExchangeRequestDTO acceptRequest(User owner, Long requestId) {
        ExchangeRequest request = findAndVerifyOwner(requestId, owner);
        if (request.getStatus() != ExchangeRequestStatus.PENDING) {
            throw new IllegalStateException("Request is no longer pending.");
        }
        request.setStatus(ExchangeRequestStatus.ACCEPTED);
        requestRepository.save(request);

        // Reject all other pending requests for this book
        List<ExchangeRequest> others = requestRepository
                .findIncomingByOwnerAndStatus(owner, ExchangeRequestStatus.PENDING);
        others.stream()
              .filter(r -> r.getBook().getId().equals(request.getBook().getId()) && !r.getId().equals(requestId))
              .forEach(r -> {
                  r.setStatus(ExchangeRequestStatus.REJECTED);
                  requestRepository.save(r);
              });

        // Create the borrow record
        borrowService.createBorrowRecord(request);
        return toDTO(request);
    }

    @Transactional
    public ExchangeRequestDTO rejectRequest(User owner, Long requestId) {
        ExchangeRequest request = findAndVerifyOwner(requestId, owner);
        if (request.getStatus() != ExchangeRequestStatus.PENDING) {
            throw new IllegalStateException("Request is no longer pending.");
        }
        request.setStatus(ExchangeRequestStatus.REJECTED);
        requestRepository.save(request);

        // If no other pending requests for this book, make it available again
        ExchangeBook book = request.getBook();
        long remaining = requestRepository.countByBookAndStatus(book, ExchangeRequestStatus.PENDING);
        if (remaining == 0) {
            book.setStatus(ExchangeBookStatus.AVAILABLE);
            bookRepository.save(book);
        }
        return toDTO(request);
    }

    @Transactional
    public ExchangeRequestDTO cancelRequest(User requester, Long requestId) {
        ExchangeRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));
        if (!request.getRequester().getId().equals(requester.getId())) {
            throw new IllegalStateException("You cannot cancel someone else's request.");
        }
        if (request.getStatus() != ExchangeRequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be cancelled.");
        }
        request.setStatus(ExchangeRequestStatus.CANCELLED);
        requestRepository.save(request);
        // Make book available again
        ExchangeBook book = request.getBook();
        book.setStatus(ExchangeBookStatus.AVAILABLE);
        bookRepository.save(book);
        return toDTO(request);
    }

    @Transactional(readOnly = true)
    public List<ExchangeRequestDTO> getMyRequests(User requester) {
        return requestRepository.findByRequester(requester).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExchangeRequestDTO> getIncomingRequests(User owner) {
        return requestRepository.findIncomingByOwner(owner).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    private ExchangeRequest findAndVerifyOwner(Long requestId, User owner) {
        ExchangeRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));
        if (!request.getBook().getOwner().getId().equals(owner.getId())) {
            throw new IllegalStateException("You are not the owner of this book.");
        }
        return request;
    }

    public ExchangeRequestDTO toDTO(ExchangeRequest req) {
        double score = reputationService.getReputationScore(req.getRequester());
        return ExchangeRequestDTO.builder()
                .id(req.getId())
                .bookId(req.getBook().getId())
                .bookTitle(req.getBook().getTitle())
                .bookAuthor(req.getBook().getAuthor())
                .bookCoverImageUrl(req.getBook().getCoverImageUrl())
                .requesterId(req.getRequester().getId())
                .requesterName(req.getRequester().getFullName())
                .requesterProfileImage(req.getRequester().getProfileImage())
                .requesterReputationScore(score)
                .message(req.getMessage())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
