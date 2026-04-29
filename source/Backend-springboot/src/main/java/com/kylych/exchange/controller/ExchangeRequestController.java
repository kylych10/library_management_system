package com.kylych.exchange.controller;

import com.kylych.exchange.dto.ExchangeRequestDTO;
import com.kylych.exchange.service.ExchangeRequestService;
import com.kylych.modal.User;
import com.kylych.exception.UserException;
import com.kylych.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exchange/requests")
@RequiredArgsConstructor
public class ExchangeRequestController {

    private final ExchangeRequestService requestService;
    private final UserService userService;

    @PostMapping("/{bookId}")
    public ResponseEntity<ExchangeRequestDTO> sendRequest(
            Principal principal,
            @PathVariable Long bookId,
            @RequestBody(required = false) Map<String, String> body) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        String message = body != null ? body.get("message") : null;
        return ResponseEntity.ok(requestService.sendRequest(user, bookId, message));
    }

    @PutMapping("/{requestId}/accept")
    public ResponseEntity<ExchangeRequestDTO> acceptRequest(
            Principal principal, @PathVariable Long requestId) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(requestService.acceptRequest(user, requestId));
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<ExchangeRequestDTO> rejectRequest(
            Principal principal, @PathVariable Long requestId) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(requestService.rejectRequest(user, requestId));
    }

    @PutMapping("/{requestId}/cancel")
    public ResponseEntity<ExchangeRequestDTO> cancelRequest(
            Principal principal, @PathVariable Long requestId) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(requestService.cancelRequest(user, requestId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ExchangeRequestDTO>> getMyRequests(Principal principal) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(requestService.getMyRequests(user));
    }

    @GetMapping("/incoming")
    public ResponseEntity<List<ExchangeRequestDTO>> getIncomingRequests(Principal principal) throws UserException {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(requestService.getIncomingRequests(user));
    }
}
