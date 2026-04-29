package com.kylych.exchange.repository;

import com.kylych.exchange.model.UserReputation;
import com.kylych.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserReputationRepository extends JpaRepository<UserReputation, Long> {
    Optional<UserReputation> findByUser(User user);

    @Query("SELECT r FROM UserReputation r WHERE r.user.id = :userId")
    Optional<UserReputation> findByUserId(@Param("userId") Long userId);
}
