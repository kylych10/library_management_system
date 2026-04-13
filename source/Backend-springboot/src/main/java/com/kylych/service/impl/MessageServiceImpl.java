package com.kylych.service.impl;

import com.kylych.modal.Message;
import com.kylych.modal.User;
import com.kylych.payload.dto.ConversationDTO;
import com.kylych.payload.dto.MessageDTO;
import com.kylych.payload.dto.UserSummaryDTO;
import com.kylych.repository.MessageRepository;
import com.kylych.repository.UserRepository;
import com.kylych.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
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

    private MessageDTO toDTO(Message m) {
        MessageDTO dto = new MessageDTO();
        dto.setId(m.getId());
        dto.setSender(toSummaryDTO(m.getSender()));
        dto.setReceiver(toSummaryDTO(m.getReceiver()));
        dto.setContent(m.getContent());
        dto.setIsRead(m.getIsRead());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }

    @Override
    public MessageDTO sendMessage(Long receiverId, String content) throws Exception {
        User current = getCurrentUser();
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new Exception("User not found"));

        if (content == null || content.isBlank()) throw new Exception("Message cannot be empty");

        Message message = new Message();
        message.setSender(current);
        message.setReceiver(receiver);
        message.setContent(content.trim());
        message.setIsRead(false);
        return toDTO(messageRepository.save(message));
    }

    @Override
    public List<MessageDTO> getConversation(Long otherUserId) throws Exception {
        User current = getCurrentUser();
        User other = userRepository.findById(otherUserId)
                .orElseThrow(() -> new Exception("User not found"));

        // Mark messages from the other user as read
        messageRepository.markConversationAsRead(other, current);

        return messageRepository.findConversation(current, other)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<ConversationDTO> getMyConversations() {
        User current = getCurrentUser();
        List<User> partners = messageRepository.findConversationPartners(current);

        List<ConversationDTO> conversations = new ArrayList<>();
        for (User partner : partners) {
            List<Message> msgs = messageRepository.findConversation(current, partner);
            if (msgs.isEmpty()) continue;

            Message last = msgs.get(msgs.size() - 1);
            long unread = msgs.stream()
                    .filter(m -> m.getReceiver().getId().equals(current.getId()) && !m.getIsRead())
                    .count();

            ConversationDTO conv = new ConversationDTO();
            conv.setPartner(toSummaryDTO(partner));
            conv.setLastMessage(last.getContent());
            conv.setLastMessageAt(last.getCreatedAt());
            conv.setUnreadCount(unread);
            conversations.add(conv);
        }

        conversations.sort(Comparator.comparing(ConversationDTO::getLastMessageAt).reversed());
        return conversations;
    }

    @Override
    public long getUnreadCount() {
        User current = getCurrentUser();
        return messageRepository.countUnreadMessages(current);
    }
}
