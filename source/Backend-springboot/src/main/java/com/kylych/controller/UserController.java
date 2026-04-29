package com.kylych.controller;

import com.kylych.exception.UserException;
import com.kylych.exchange.model.UserReputation;
import com.kylych.exchange.repository.UserReputationRepository;
import com.kylych.mapper.UserMapper;
import com.kylych.modal.User;
import com.kylych.payload.dto.PublicProfileDTO;
import com.kylych.payload.dto.UserDTO;
import com.kylych.payload.request.UpdateProfileRequest;
import com.kylych.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;
	private final UserReputationRepository reputationRepository;




	@GetMapping("/api/users/profile")
	public ResponseEntity<UserDTO> getUserProfileFromJwtHandler(
			@RequestHeader("Authorization") String jwt) throws UserException {
		User user = userService.getUserFromJwtToken(jwt);
		UserDTO userDTO=UserMapper.toDTO(user);

		return new ResponseEntity<>(userDTO,HttpStatus.OK);
	}

	/**
	 * Update current user's profile
	 * PUT /api/users/profile
	 */
	@PutMapping("/api/users/profile")
	public ResponseEntity<UserDTO> updateProfileHandler(
			@RequestHeader("Authorization") String jwt,
			@RequestBody UpdateProfileRequest request) throws UserException {
		User user = userService.updateProfile(jwt, request);
		UserDTO userDTO = UserMapper.toDTO(user);
		return new ResponseEntity<>(userDTO, HttpStatus.OK);
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

	@GetMapping("/api/users/{userId}/public-profile")
	@org.springframework.transaction.annotation.Transactional(readOnly = true)
	public ResponseEntity<PublicProfileDTO> getPublicProfile(@PathVariable Long userId) throws UserException {
		User user = userService.getUserById(userId);
		var rep = reputationRepository.findByUserId(userId);
		PublicProfileDTO dto = PublicProfileDTO.builder()
				.id(user.getId())
				.fullName(user.getFullName())
				.profileImage(user.getProfileImage())
				.phone(user.getPhone())
				.memberSince(user.getCreatedAt())
				.lastLogin(user.getLastLogin())
				.verified(user.getVerified())
				.reputationScore(rep.map(UserReputation::getReputationScore).orElse(5.0))
				.totalExchanges(rep.map(UserReputation::getTotalExchanges).orElse(0))
				.totalBorrows(rep.map(UserReputation::getTotalBorrows).orElse(0))
				.penaltyPoints(rep.map(UserReputation::getPenaltyPoints).orElse(0))
				.blockedFromExchange(rep.map(UserReputation::getBlockedFromExchange).orElse(false))
				.build();
		return ResponseEntity.ok(dto);
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