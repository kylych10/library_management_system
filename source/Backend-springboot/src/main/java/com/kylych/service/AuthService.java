package com.kylych.service;

import com.kylych.exception.UserException;
import com.kylych.payload.dto.UserDTO;
import com.kylych.payload.response.AuthResponse;



public interface AuthService {
    AuthResponse login(String username, String password) throws UserException;
    AuthResponse signup(UserDTO req) throws UserException;

    void createPasswordResetToken(String email) throws UserException;
    void resetPassword(String token, String newPassword);
}
