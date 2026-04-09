package com.kylych.service;


import com.kylych.domain.UserRole;
import com.kylych.exception.UserException;
import com.kylych.modal.User;
import com.kylych.payload.dto.UserDTO;

import java.util.List;
import java.util.Set;
//import com.kylych.payload.request.UpdateUserDto;


public interface UserService {
	User getUserByEmail(String email) throws UserException;
	User getUserFromJwtToken(String jwt) throws UserException;
	User getUserById(Long id) throws UserException;
	Set<User> getUserByRole(UserRole role) throws UserException;
	List<User> getUsers() throws UserException;
	User getCurrentUser() throws UserException;



	/**
	 * Get total count of all registered users (Admin only)
	 */
	long getTotalUserCount();

	/**
	 * Update user role (Admin only)
	 */
	User updateUserRole(Long userId, UserRole role) throws UserException;

	/**
	 * Toggle user verified status (Admin only)
	 */
	User toggleUserVerification(Long userId) throws UserException;
}