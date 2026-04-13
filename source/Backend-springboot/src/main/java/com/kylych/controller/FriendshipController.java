package com.kylych.controller;

import com.kylych.payload.dto.FriendshipDTO;
import com.kylych.payload.dto.UserSummaryDTO;
import com.kylych.payload.response.ApiResponse;
import com.kylych.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@Slf4j
public class FriendshipController {

    private final FriendshipService friendshipService;

    // Send friend request
    @PostMapping("/request/{receiverId}")
    public ResponseEntity<?> sendRequest(@PathVariable Long receiverId) {
        try {
            FriendshipDTO dto = friendshipService.sendRequest(receiverId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage(), false));
        }
    }

    // Accept friend request
    @PutMapping("/accept/{friendshipId}")
    public ResponseEntity<?> acceptRequest(@PathVariable Long friendshipId) {
        try {
            FriendshipDTO dto = friendshipService.acceptRequest(friendshipId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage(), false));
        }
    }

    // Decline friend request
    @PutMapping("/decline/{friendshipId}")
    public ResponseEntity<?> declineRequest(@PathVariable Long friendshipId) {
        try {
            FriendshipDTO dto = friendshipService.declineRequest(friendshipId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage(), false));
        }
    }

    // Remove friend / cancel request
    @DeleteMapping("/{friendshipId}")
    public ResponseEntity<?> removeFriend(@PathVariable Long friendshipId) {
        try {
            friendshipService.removeFriend(friendshipId);
            return ResponseEntity.ok(new ApiResponse("Removed successfully", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage(), false));
        }
    }

    // Get my friends (accepted)
    @GetMapping("/my")
    public ResponseEntity<List<FriendshipDTO>> getMyFriends() {
        return ResponseEntity.ok(friendshipService.getMyFriends());
    }

    // Get incoming pending requests
    @GetMapping("/requests/pending")
    public ResponseEntity<List<FriendshipDTO>> getPendingRequests() {
        return ResponseEntity.ok(friendshipService.getPendingRequests());
    }

    // Get outgoing sent requests
    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendshipDTO>> getSentRequests() {
        return ResponseEntity.ok(friendshipService.getSentRequests());
    }

    // Search users to add
    @GetMapping("/search")
    public ResponseEntity<List<UserSummaryDTO>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(friendshipService.searchUsers(q));
    }

    // Get friendship status with a specific user
    @GetMapping("/status/{otherUserId}")
    public ResponseEntity<?> getFriendshipStatus(@PathVariable Long otherUserId) {
        FriendshipDTO dto = friendshipService.getFriendshipStatus(otherUserId);
        return ResponseEntity.ok(dto); // null means no relationship
    }
}
