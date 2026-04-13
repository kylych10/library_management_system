package com.kylych.repository;

import com.kylych.domain.FriendshipStatus;
import com.kylych.modal.Friendship;
import com.kylych.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("SELECT f FROM Friendship f WHERE (f.requester = :user OR f.receiver = :user) AND f.status = :status")
    List<Friendship> findAllByUserAndStatus(@Param("user") User user, @Param("status") FriendshipStatus status);

    @Query("SELECT f FROM Friendship f WHERE f.receiver = :user AND f.status = 'PENDING'")
    List<Friendship> findPendingRequestsForUser(@Param("user") User user);

    @Query("SELECT f FROM Friendship f WHERE f.requester = :user AND f.status = 'PENDING'")
    List<Friendship> findSentRequestsByUser(@Param("user") User user);

    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.requester = :u1 AND f.receiver = :u2) OR (f.requester = :u2 AND f.receiver = :u1)")
    Optional<Friendship> findBetweenUsers(@Param("u1") User u1, @Param("u2") User u2);

    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f WHERE " +
           "((f.requester = :u1 AND f.receiver = :u2) OR (f.requester = :u2 AND f.receiver = :u1)) " +
           "AND f.status = 'ACCEPTED'")
    boolean areFriends(@Param("u1") User u1, @Param("u2") User u2);
}
