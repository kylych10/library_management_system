package com.kylych.service.impl;


import com.kylych.configurations.JwtProvider;
import com.kylych.domain.UserRole;
import com.kylych.exception.UserException;
import com.kylych.modal.User;
import com.kylych.payload.dto.UserDTO;
import com.kylych.payload.request.UpdateProfileRequest;
import com.kylych.repository.UserRepository;
import com.kylych.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {


	private final UserRepository userRepository;

	private final JwtProvider jwtProvider;


	@Override
	public User getUserByEmail(String email) throws UserException {
		User user=userRepository.findByEmail(email);
		if(user==null){
			throw new UserException("User not found with email: "+email);
		}
		return user;
	}

	@Override
	public User getUserFromJwtToken(String jwt) throws UserException {
		String email = jwtProvider.getEmailFromJwtToken(jwt);
		User user = userRepository.findByEmail(email);
		if(user==null) throw new UserException("user not exist with email "+email);
		return user;
	}

	@Override
	public User getUserById(Long id) throws UserException {
		return userRepository.findById(id).orElse(null);
	}

	@Override
	public Set<User> getUserByRole(UserRole role) throws UserException {
		return userRepository.findByRole(role);
	}

	@Override
	public User getCurrentUser() {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		User user= userRepository.findByEmail(email);
		if(user == null) {
			throw new EntityNotFoundException("User not found");
		}
		return user;
	}



	@Override
	public List<User> getUsers() throws UserException {
		return userRepository.findAll();
	}

	@Override
	public long getTotalUserCount() {
		return userRepository.count();
	}

	@Override
	public User updateUserRole(Long userId, UserRole role) throws UserException {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UserException("User not found with id: " + userId));
		user.setRole(role);
		return userRepository.save(user);
	}

	@Override
	public User toggleUserVerification(Long userId) throws UserException {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UserException("User not found with id: " + userId));
		user.setVerified(!user.getVerified());
		return userRepository.save(user);
	}

	@Override
	public User updateProfile(String jwt, UpdateProfileRequest request) throws UserException {
		User user = getUserFromJwtToken(jwt);
		if (request.getFullName() != null && !request.getFullName().isBlank()) {
			user.setFullName(request.getFullName());
		}
		if (request.getPhone() != null) {
			user.setPhone(request.getPhone());
		}
		if (request.getProfileImage() != null) {
			user.setProfileImage(request.getProfileImage());
		}
		return userRepository.save(user);
	}

}