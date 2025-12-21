package com.nomad.auth.repository;

import com.nomad.auth.domain.FriendRequest;
import com.nomad.auth.domain.FriendStatus;
import com.nomad.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {

    @Query("SELECT case when count(fr)> 0 then true else false end FROM FriendRequest fr WHERE " +
            "(fr.sender = :user1 AND fr.receiver = :user2) OR (fr.sender = :user2 AND fr.receiver = :user1)")
    boolean existsBetween(User user1, User user2);

    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendStatus status);

    List<FriendRequest> findBySenderAndStatus(User sender, FriendStatus status);
}