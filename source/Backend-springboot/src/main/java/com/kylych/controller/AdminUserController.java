package com.kylych.controller;

import com.kylych.domain.UserRole;
import com.kylych.exception.UserException;
import com.kylych.mapper.UserMapper;
import com.kylych.modal.User;
import com.kylych.payload.dto.UserDTO;
import com.kylych.payload.response.ApiResponse;
import com.kylych.repository.UserRepository;
import com.kylych.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin-only controller for user management operations.
 *
 * PLACE FILE AT:
 *   src/main/java/com/zosh/controller/AdminUserController.java
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // ---------------------------------------------------------------
    // GET /api/admin/users
    // Returns all users as UserDTO list.
    // The frontend filters/paginates client-side (usersList is small).
    // ---------------------------------------------------------------
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() throws UserException {
        List<User> users = userService.getUsers();
        List<UserDTO> dtos = users.stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ---------------------------------------------------------------
    // PUT /api/admin/users/{id}/role
    // Body: { "role": "ADMIN" }   or   { "role": "ROLE_USER" }
    // Upgrades or downgrades a user's role.
    // ---------------------------------------------------------------
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) throws UserException {

        User user = userService.getUserById(id);

        // Accept both "ADMIN" and "ROLE_ADMIN" from the frontend
        String roleStr = request.getRole().replace("ROLE_", "");
        user.setRole(UserRole.valueOf(roleStr));
        userRepository.save(user);

        return ResponseEntity.ok(new ApiResponse(
                "User role updated to " + roleStr, true ));
    }

    // ---------------------------------------------------------------
    // PUT /api/admin/users/{id}/toggle-verified
    // Body: { "verified": true }  or  { "verified": false }
    // Enables or disables the user account (uses the `verified` flag).
    // ---------------------------------------------------------------
    @PutMapping("/{id}/toggle-verified")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> toggleUserVerified(
            @PathVariable Long id,
            @RequestBody ToggleVerifiedRequest request) throws UserException {

        User user = userService.getUserById(id);
        user.setVerified(request.isVerified());
        userRepository.save(user);

        String status = request.isVerified() ? "verified" : "unverified";
        return ResponseEntity.ok(new ApiResponse("User marked as " + status, true));
    }

    // ---------------------------------------------------------------
    // Inner request DTOs (no extra files needed)
    // ---------------------------------------------------------------

    public static class UpdateRoleRequest {
        private String role;
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class ToggleVerifiedRequest {
        private boolean verified;
        public boolean isVerified() { return verified; }
        public void setVerified(boolean verified) { this.verified = verified; }
    }
}