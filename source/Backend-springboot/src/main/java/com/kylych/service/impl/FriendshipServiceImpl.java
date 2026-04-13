package com.kylych.service.impl;

import com.kylych.domain.FriendshipStatus;
import com.kylych.modal.Friendship;
import com.kylych.modal.User;
import com.kylych.payload.dto.FriendshipDTO;
import com.kylych.payload.dto.UserSummaryDTO;
import com.kylych.repository.FriendshipRepository;
import com.kylych.repository.UserRepository;
import com.kylych.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipServiceImpl implements FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email);
    }

    private UserSummaryDTO toSummaryDTO(User user) {
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setProfileImage(user.getProfileImage());
        return dto;
    }

    private FriendshipDTO toDTO(Friendship f) {
        FriendshipDTO dto = new FriendshipDTO();
        dto.setId(f.getId());
        dto.setRequester(toSummaryDTO(f.getRequester()));
        dto.setReceiver(toSummaryDTO(f.getReceiver()));
        dto.setStatus(f.getStatus());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }

    @Override
    public FriendshipDTO sendRequest(Long receiverId) throws Exception {
        User current = getCurrentUser();
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new Exception("User not found"));

        if (current.getId().equals(receiverId)) throw new Exception("Cannot add yourself");

        Optional<Friendship> existing = friendshipRepository.findBetweenUsers(current, receiver);
        if (existing.isPresent()) throw new Exception("Friend request already exists");

        Friendship friendship = new Friendship();
        friendship.setRequester(current);
        friendship.setReceiver(receiver);
        friendship.setStatus(FriendshipStatus.PENDING);
        return toDTO(friendshipRepository.save(friendship));
    }

    @Override
    public FriendshipDTO acceptRequest(Long friendshipId) throws Exception {
        User current = getCurrentUser();
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new Exception("Request not found"));

        if (!friendship.getReceiver().getId().equals(current.getId()))
            throw new Exception("Not authorized");

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return toDTO(friendshipRepository.save(friendship));
    }

    @Override
    public FriendshipDTO declineRequest(Long friendshipId) throws Exception {
        User current = getCurrentUser();
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new Exception("Request not found"));

        if (!friendship.getReceiver().getId().equals(current.getId()))
            throw new Exception("Not authorized");

        friendship.setStatus(FriendshipStatus.DECLINED);
        return toDTO(friendshipRepository.save(friendship));
    }

    @Override
    public void removeFriend(Long friendshipId) throws Exception {
        User current = getCurrentUser();
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new Exception("Friendship not found"));

        if (!friendship.getRequester().getId().equals(current.getId()) &&
            !friendship.getReceiver().getId().equals(current.getId()))
            throw new Exception("Not authorized");

        friendshipRepository.delete(friendship);
    }

    @Override
    public List<FriendshipDTO> getMyFriends() {
        User current = getCurrentUser();
        return friendshipRepository.findAllByUserAndStatus(current, FriendshipStatus.ACCEPTED)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<FriendshipDTO> getPendingRequests() {
        User current = getCurrentUser();
        return friendshipRepository.findPendingRequestsForUser(current)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<FriendshipDTO> getSentRequests() {
        User current = getCurrentUser();
        return friendshipRepository.findSentRequestsByUser(current)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<UserSummaryDTO> searchUsers(String query) {
        User current = getCurrentUser();
        String q = query.toLowerCase();
        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(current.getId()))
                .filter(u -> u.getFullName().toLowerCase().contains(q) || u.getEmail().toLowerCase().contains(q))
                .map(this::toSummaryDTO)
                .limit(20)
                .collect(Collectors.toList());
    }

    @Override
    public FriendshipDTO getFriendshipStatus(Long otherUserId) {
        User current = getCurrentUser();
        User other = userRepository.findById(otherUserId).orElse(null);
        if (other == null) return null;
        return friendshipRepository.findBetweenUsers(current, other).map(this::toDTO).orElse(null);
    }
}
