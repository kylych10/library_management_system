package com.kylych.service;

import com.kylych.payload.dto.FriendshipDTO;
import com.kylych.payload.dto.UserSummaryDTO;
import java.util.List;

public interface FriendshipService {
    FriendshipDTO sendRequest(Long receiverId) throws Exception;
    FriendshipDTO acceptRequest(Long friendshipId) throws Exception;
    FriendshipDTO declineRequest(Long friendshipId) throws Exception;
    void removeFriend(Long friendshipId) throws Exception;
    List<FriendshipDTO> getMyFriends();
    List<FriendshipDTO> getPendingRequests();
    List<FriendshipDTO> getSentRequests();
    List<UserSummaryDTO> searchUsers(String query);
    FriendshipDTO getFriendshipStatus(Long otherUserId);
}
