package com.kylych.exchange.controller;

import com.kylych.exchange.dto.ExchangeBorrowRecordDTO;
import com.kylych.exchange.dto.ExchangeRatingRequest;
import com.kylych.exchange.service.ExchangeBorrowService;
import com.kylych.modal.User;
import com.kylych.exception.UserException;
import com.kylych.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/exchange/borrows")
@RequiredArgsConstructor
public class ExchangeBorrowController {

    private final ExchangeBorrowService borrowService;
    private final UserService userService;

    @GetMapping("/my")
    public ResponseEntity<List<ExchangeBorrowRecordDTO>> getMyBorrows(Principal principal) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(borrowService.getMyBorrows(user));
    }

    @GetMapping("/my-lends")
    public ResponseEntity<List<ExchangeBorrowRecordDTO>> getMyLends(Principal principal) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(borrowService.getMyLends(user));
    }

    @PutMapping("/{recordId}/return")
    public ResponseEntity<ExchangeBorrowRecordDTO> returnBook(
            Principal principal, @PathVariable Long recordId) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(borrowService.returnBook(user, recordId));
    }

    @PostMapping("/{recordId}/rate-lender")
    public ResponseEntity<ExchangeBorrowRecordDTO> rateLender(
            Principal principal,
            @PathVariable Long recordId,
            @Valid @RequestBody ExchangeRatingRequest req) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(borrowService.rateLender(user, recordId, req));
    }

    @PostMapping("/{recordId}/rate-borrower")
    public ResponseEntity<ExchangeBorrowRecordDTO> rateBorrower(
            Principal principal,
            @PathVariable Long recordId,
            @Valid @RequestBody ExchangeRatingRequest req) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(borrowService.rateBorrower(user, recordId, req));
    }
}
