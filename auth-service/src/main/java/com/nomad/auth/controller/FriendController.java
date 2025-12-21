package com.nomad.auth.controller;

import com.nomad.auth.domain.FriendRequest;
import com.nomad.auth.domain.FriendStatus;
import com.nomad.auth.domain.User;
import com.nomad.auth.repository.FriendRequestRepository;
import com.nomad.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    //  Search Users
    @GetMapping("/search")
    public ResponseEntity<List<User>> search(@RequestParam String query) {
        return ResponseEntity.ok(userRepository.searchUsers(query, getCurrentUser().getId()));
    }

    //  Send Request
    @PostMapping("/request/{receiverId}")
    public ResponseEntity<String> sendRequest(@PathVariable UUID receiverId) {
        User sender = getCurrentUser();
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new RuntimeException("User not found"));

        if (friendRequestRepository.existsBetween(sender, receiver)) {
            return ResponseEntity.badRequest().body("Request already exists or you are already friends");
        }

        FriendRequest request = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendStatus.PENDING)
                .build();

        friendRequestRepository.save(request);
        return ResponseEntity.ok("Friend request sent!");
    }

    //  Get My Pending Requests
    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequest>> getPendingRequests() {
        return ResponseEntity.ok(friendRequestRepository.findByReceiverAndStatus(getCurrentUser(), FriendStatus.PENDING));
    }

    // Accept Request
    @PostMapping("/accept/{requestId}")
    public ResponseEntity<String> acceptRequest(@PathVariable UUID requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Security check: Only the receiver can accept
        if (!request.getReceiver().getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        request.setStatus(FriendStatus.ACCEPTED);
        friendRequestRepository.save(request);
        return ResponseEntity.ok("Friend request accepted!");
    }

    //  List My Friends
    @GetMapping
    public ResponseEntity<List<User>> getFriends() {
        User me = getCurrentUser();

        // Get requests where I sent AND status is ACCEPTED
        List<User> sentFriends = friendRequestRepository.findBySenderAndStatus(me, FriendStatus.ACCEPTED)
                .stream().map(FriendRequest::getReceiver).toList();

        // Get requests where I received AND status is ACCEPTED
        List<User> receivedFriends = friendRequestRepository.findByReceiverAndStatus(me, FriendStatus.ACCEPTED)
                .stream().map(FriendRequest::getSender).toList();


        java.util.ArrayList<User> allFriends = new java.util.ArrayList<>(sentFriends);
        allFriends.addAll(receivedFriends);

        return ResponseEntity.ok(allFriends);
    }
}