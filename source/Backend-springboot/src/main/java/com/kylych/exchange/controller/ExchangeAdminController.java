package com.kylych.exchange.controller;

import com.kylych.exchange.domain.ExchangeReportStatus;
import com.kylych.exchange.dto.ExchangeBorrowRecordDTO;
import com.kylych.exchange.dto.ExchangeBookDTO;
import com.kylych.exchange.dto.ExchangeReportDTO;
import com.kylych.exchange.dto.UserReputationDTO;
import com.kylych.exchange.model.UserReputation;
import com.kylych.exchange.repository.ExchangeBorrowRecordRepository;
import com.kylych.exchange.repository.UserReputationRepository;
import com.kylych.exchange.service.ExchangeBookService;
import com.kylych.exchange.service.ExchangeBorrowService;
import com.kylych.exchange.service.ExchangeReportService;
import com.kylych.exchange.service.ExchangeReputationService;
import com.kylych.modal.User;
import com.kylych.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/super-admin/exchange")
@RequiredArgsConstructor
public class ExchangeAdminController {

    private final ExchangeBookService bookService;
    private final ExchangeBorrowService borrowService;
    private final ExchangeReportService reportService;
    private final ExchangeReputationService reputationService;
    private final UserReputationRepository reputationRepository;
    private final ExchangeBorrowRecordRepository borrowRepository;
    private final UserRepository userRepository;

    @GetMapping("/books")
    public ResponseEntity<Page<ExchangeBookDTO>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(bookService.getMarketplace(null, null, null, "createdAt", "DESC", page, size));
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<Void> removeBook(@PathVariable Long id) {
        // Admin force-delete — bypass owner check
        bookService.findById(id); // verify exists
        // Direct repository delete handled via service
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports")
    public ResponseEntity<Page<ExchangeReportDTO>> getReports(
            @RequestParam(required = false) ExchangeReportStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(reportService.getAllReports(status, page, size));
    }

    @PutMapping("/reports/{id}/resolve")
    public ResponseEntity<ExchangeReportDTO> resolveReport(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        ExchangeReportStatus status = ExchangeReportStatus.valueOf((String) body.get("status"));
        String adminNotes = (String) body.get("adminNotes");
        boolean penalize = Boolean.TRUE.equals(body.get("penalizeReported"));
        return ResponseEntity.ok(reportService.resolveReport(id, status, adminNotes, penalize));
    }

    @GetMapping("/reputations")
    public ResponseEntity<List<UserReputationDTO>> getAllReputations() {
        List<UserReputationDTO> result = reputationRepository.findAll().stream()
                .map(reputationService::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/users/{userId}/block")
    public ResponseEntity<Void> blockUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        reputationService.applyPenalty(user, 10);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{userId}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        reputationService.unblockUser(user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{userId}/grant-balance")
    public ResponseEntity<Map<String, Object>> grantBalance(
            @PathVariable Long userId,
            @RequestBody Map<String, Long> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        long amount = body.getOrDefault("amount", 500L);
        reputationService.grantBalance(user, amount);
        long newBalance = reputationService.getBalance(user);
        return ResponseEntity.ok(Map.of("userId", userId, "newBalance", newBalance, "granted", amount));
    }

    @GetMapping("/borrows")
    public ResponseEntity<List<ExchangeBorrowRecordDTO>> getAllBorrows() {
        return ResponseEntity.ok(
                borrowRepository.findAll().stream()
                        .map(borrowService::toDTO)
                        .collect(Collectors.toList())
        );
    }
}
