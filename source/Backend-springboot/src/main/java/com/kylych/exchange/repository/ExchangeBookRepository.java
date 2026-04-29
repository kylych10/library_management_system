package com.kylych.exchange.repository;

import com.kylych.exchange.domain.ExchangeBookStatus;
import com.kylych.exchange.model.ExchangeBook;
import com.kylych.modal.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExchangeBookRepository extends JpaRepository<ExchangeBook, Long> {

    Page<ExchangeBook> findByStatus(ExchangeBookStatus status, Pageable pageable);

    List<ExchangeBook> findByOwner(User owner);

    @Query("SELECT b FROM ExchangeBook b WHERE b.status = 'AVAILABLE' " +
           "AND (:user IS NULL OR b.owner != :user) " +
           "AND (:condition IS NULL OR b.condition = :condition) " +
           "AND (:q IS NULL OR :q = '' " +
           "  OR LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "  OR LOWER(b.author) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "  OR LOWER(b.genre) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<ExchangeBook> findMarketplaceFiltered(
            @Param("user") User user,
            @Param("q") String q,
            @Param("condition") com.kylych.exchange.domain.BookCondition condition,
            Pageable pageable);
}
