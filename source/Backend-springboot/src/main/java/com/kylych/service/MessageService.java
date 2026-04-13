package com.kylych.service;

import com.kylych.payload.dto.ConversationDTO;
import com.kylych.payload.dto.MessageDTO;
import java.util.List;

public interface MessageService {
    MessageDTO sendMessage(Long receiverId, String content) throws Exception;
    List<MessageDTO> getConversation(Long otherUserId) throws Exception;
    List<ConversationDTO> getMyConversations();
    long getUnreadCount();
}
