package com.kylych.repository;


import com.kylych.domain.UserRole;
import com.kylych.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Set;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);
    Set<User> findByRole(UserRole role);
}
