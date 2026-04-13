package com.kylych.controller;

import com.kylych.payload.dto.ConversationDTO;
import com.kylych.payload.dto.MessageDTO;
import com.kylych.payload.response.ApiResponse;
import com.kylych.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;

    // Send a message
    @PostMapping("/send/{receiverId}")
    public ResponseEntity<?> sendMessage(@PathVariable Long receiverId,
                                          @RequestBody Map<String, String> body) {
        try {
            String content = body.get("content");
            MessageDTO dto = messageService.sendMessage(receiverId, content);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage(), false));
        }
    }

    // Get conversation with a user
    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<?> getConversation(@PathVariable Long otherUserId) {
        try {
            List<MessageDTO> messages = messageService.getConversation(otherUserId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage(), false));
        }
    }

    // Get all conversations (inbox summary)
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getMyConversations() {
        return ResponseEntity.ok(messageService.getMyConversations());
    }

    // Get unread message count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount()));
    }
}
