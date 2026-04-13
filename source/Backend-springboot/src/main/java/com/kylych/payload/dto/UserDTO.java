package com.kylych.payload.dto;

import com.kylych.domain.UserRole;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String password;
    private String phone;
    private String fullName;
    private UserRole role;
    private String username;
    private String profileImage;
    private Boolean verified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}