package com.kylych.exchange.controller;

import com.kylych.exchange.dto.CreateExchangeBookRequest;
import com.kylych.exchange.dto.ExchangeBookDTO;
import com.kylych.exchange.service.ExchangeBookService;
import com.kylych.modal.User;
import com.kylych.exception.UserException;
import com.kylych.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/exchange/books")
@RequiredArgsConstructor
public class ExchangeBookController {

    private final ExchangeBookService bookService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<ExchangeBookDTO>> getMarketplace(
            Principal principal,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String condition,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(bookService.getMarketplace(user, q, condition, sortBy, sortDir, page, size));
    }

    @GetMapping("/balance")
    public ResponseEntity<java.util.Map<String, Object>> getMyBalance(Principal principal) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        long balance = bookService.getMyBalance(user);
        return ResponseEntity.ok(java.util.Map.of(
                "balance", balance,
                "depositRequired", com.kylych.exchange.service.ExchangeReputationService.DEFAULT_DEPOSIT,
                "canBorrow", balance >= com.kylych.exchange.service.ExchangeReputationService.DEFAULT_DEPOSIT));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ExchangeBookDTO>> getMyBooks(Principal principal) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(bookService.getMyBooks(user));
    }

    @PostMapping
    public ResponseEntity<ExchangeBookDTO> createBook(
            Principal principal,
            @Valid @RequestBody CreateExchangeBookRequest req) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(bookService.createBook(user, req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExchangeBookDTO> updateBook(
            Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody CreateExchangeBookRequest req) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(bookService.updateBook(id, user, req));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleAvailability(Principal principal, @PathVariable Long id) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        bookService.toggleAvailability(id, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(Principal principal, @PathVariable Long id) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        bookService.deleteBook(id, user);
        return ResponseEntity.noContent().build();
    }
}
