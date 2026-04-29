package com.kylych.exchange.repository;

import com.kylych.exchange.domain.ExchangeRequestStatus;
import com.kylych.exchange.model.ExchangeBook;
import com.kylych.exchange.model.ExchangeRequest;
import com.kylych.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExchangeRequestRepository extends JpaRepository<ExchangeRequest, Long> {

    List<ExchangeRequest> findByRequester(User requester);

    List<ExchangeRequest> findByRequesterAndStatus(User requester, ExchangeRequestStatus status);

    // Requests for books owned by this user
    @Query("SELECT r FROM ExchangeRequest r WHERE r.book.owner = :owner")
    List<ExchangeRequest> findIncomingByOwner(@Param("owner") User owner);

    @Query("SELECT r FROM ExchangeRequest r WHERE r.book.owner = :owner AND r.status = :status")
    List<ExchangeRequest> findIncomingByOwnerAndStatus(@Param("owner") User owner,
                                                        @Param("status") ExchangeRequestStatus status);

    Optional<ExchangeRequest> findByBookAndRequesterAndStatus(ExchangeBook book, User requester,
                                                              ExchangeRequestStatus status);

    long countByRequesterAndStatus(User requester, ExchangeRequestStatus status);

    long countByBookAndStatus(ExchangeBook book, ExchangeRequestStatus status);

    List<ExchangeRequest> findByBookAndStatus(ExchangeBook book, ExchangeRequestStatus status);

    boolean existsByBookAndRequesterAndStatus(ExchangeBook book, User requester, ExchangeRequestStatus status);
}
