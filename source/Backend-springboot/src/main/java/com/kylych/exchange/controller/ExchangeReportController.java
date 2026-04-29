package com.kylych.exchange.controller;

import com.kylych.exchange.dto.ExchangeReportDTO;
import com.kylych.exchange.dto.ExchangeReportRequest;
import com.kylych.exchange.service.ExchangeReportService;
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
@RequestMapping("/api/exchange/reports")
@RequiredArgsConstructor
public class ExchangeReportController {

    private final ExchangeReportService reportService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ExchangeReportDTO> createReport(
            Principal principal,
            @Valid @RequestBody ExchangeReportRequest req) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(reportService.createReport(user, req));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ExchangeReportDTO>> getMyReports(Principal principal) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(reportService.getMyReports(user));
    }
}
