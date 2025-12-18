package com.storemanagement.controller;

import com.storemanagement.dto.chat.ChatMessageRequest;
import com.storemanagement.dto.chat.ChatMessageDTO;
import com.storemanagement.dto.chat.WebSocketErrorDTO;
import com.storemanagement.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request, Principal principal) {
        log.info("Received WebSocket message from {} ID: {} to conversation ID: {}",
                request.getSenderType(), request.getSenderId(), request.getConversationId());

        try {

            ChatMessageDTO savedMessage = chatService.sendMessage(request, principal);

            String destination = "/topic/chat." + request.getConversationId();
            messagingTemplate.convertAndSend(destination, savedMessage);

            log.info("Message broadcasted to {}", destination);

        } catch (AccessDeniedException e) {
            log.warn("Access denied for message from {} ID: {} to conversation ID: {} - {}",
                    request.getSenderType(), request.getSenderId(),
                    request.getConversationId(), e.getMessage());
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage(), e);
        }
    }
}
