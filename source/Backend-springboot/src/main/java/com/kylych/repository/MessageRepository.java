package com.kylych.repository;

import com.kylych.modal.Message;
import com.kylych.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :u1 AND m.receiver = :u2) OR (m.sender = :u2 AND m.receiver = :u1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("u1") User u1, @Param("u2") User u2);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    void markConversationAsRead(@Param("sender") User sender, @Param("receiver") User receiver);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :user AND m.isRead = false")
    long countUnreadMessages(@Param("user") User user);

    @Query("SELECT DISTINCT u FROM User u WHERE u IN " +
           "(SELECT m.receiver FROM Message m WHERE m.sender = :user) OR u IN " +
           "(SELECT m.sender FROM Message m WHERE m.receiver = :user)")
    List<User> findConversationPartners(@Param("user") User user);
}
