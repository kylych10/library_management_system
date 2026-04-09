package com.kylych.controller;

import com.kylych.exception.UserException;
import com.kylych.mapper.UserMapper;
import com.kylych.modal.User;


import com.kylych.payload.dto.UserDTO;
import com.kylych.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;




	@GetMapping("/api/users/profile")
	public ResponseEntity<UserDTO> getUserProfileFromJwtHandler(
			@RequestHeader("Authorization") String jwt) throws UserException {
		User user = userService.getUserFromJwtToken(jwt);
		UserDTO userDTO=UserMapper.toDTO(user);

		return new ResponseEntity<>(userDTO,HttpStatus.OK);
	}



	@GetMapping("/users/list")
	public ResponseEntity<List<User>> getUsersListHandler() throws UserException {
		List<User> users = userService.getUsers();

		return new ResponseEntity<>(users,HttpStatus.OK);
	}

	@GetMapping("/users/{userId}")
	public ResponseEntity<UserDTO> getUserByIdHandler(
			@PathVariable Long userId
	) throws UserException {
		User user = userService.getUserById(userId);
		UserDTO userDTO=UserMapper.toDTO(user);

		return new ResponseEntity<>(userDTO,HttpStatus.OK);
	}

	/**
	 * Update user role (Admin only)
	 * PUT /api/users/{userId}/role?role=ROLE_ADMIN
	 */
	@PutMapping("/api/users/{userId}/role")
	public ResponseEntity<UserDTO> updateUserRole(
			@PathVariable Long userId,
			@RequestParam String role
	) throws UserException {
		com.kylych.domain.UserRole userRole = com.kylych.domain.UserRole.valueOf(role);
		User user = userService.updateUserRole(userId, userRole);
		return ResponseEntity.ok(UserMapper.toDTO(user));
	}

	/**
	 * Toggle user verified status (Admin only)
	 * PUT /api/users/{userId}/toggle-verification
	 */
	@PutMapping("/api/users/{userId}/toggle-verification")
	public ResponseEntity<UserDTO> toggleUserVerification(
			@PathVariable Long userId
	) throws UserException {
		User user = userService.toggleUserVerification(userId);
		return ResponseEntity.ok(UserMapper.toDTO(user));
	}

	/**
	 * Get total user statistics (Admin only)
	 * GET /api/users/statistics
	 *
	 * Returns total number of registered users in the system
	 *
	 * Example response:
	 * {
	 *   "totalUsers": 245
	 * }
	 */
	@GetMapping("/api/users/statistics")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<UserStatisticsResponse> getUserStatistics() {
		long totalUsers = userService.getTotalUserCount();
		return ResponseEntity.ok(new UserStatisticsResponse(totalUsers));
	}

	/**
	 * Response DTO for user statistics endpoint
	 */
	public static class UserStatisticsResponse {
		public long totalUsers;

		public UserStatisticsResponse(long totalUsers) {
			this.totalUsers = totalUsers;
		}
	}

}