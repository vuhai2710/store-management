package com.storemanagement.controller;

import com.storemanagement.dto.request.ChatMessageRequest;
import com.storemanagement.dto.response.ChatMessageDto;
import com.storemanagement.dto.response.WebSocketErrorDto;
import com.storemanagement.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;

import java.time.Instant;

/**
 * WebSocket Controller cho Real-time Chat
 * 
 * Xử lý tin nhắn realtime qua WebSocket/STOMP protocol
 * 
 * Message Flow:
 * 1. Client gửi tin nhắn đến /app/chat.send (prefix /app được định nghĩa trong WebSocketConfig)
 * 2. @MessageMapping xử lý và lưu tin nhắn vào database
 * 3. Broadcast tin nhắn đến tất cả subscribers của /topic/chat.{conversationId}
 * 4. Tất cả clients đang lắng nghe /topic/chat.{conversationId} nhận được tin nhắn realtime
 * 
 * Frontend Integration:
 * - Client connect to: ws://localhost:8080/ws (with SockJS)
 * - Client subscribes to: /topic/chat.{conversationId}
 * - Client sends message to: /app/chat.send
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {
    
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Xử lý tin nhắn gửi từ client
     * 
     * Endpoint: /app/chat.send (client gửi đến endpoint này)
     * Broadcast: /topic/chat.{conversationId} (tin nhắn được gửi đến topic này)
     * 
     * @param request ChatMessageRequest từ client
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request) {
        log.info("Received WebSocket message from {} ID: {} to conversation ID: {}", 
                request.getSenderType(), request.getSenderId(), request.getConversationId());
        
        try {
            // Lưu tin nhắn vào database
            ChatMessageDto savedMessage = chatService.sendMessage(request);
            
            // Broadcast tin nhắn đến tất cả subscribers của conversation này
            String destination = "/topic/chat." + request.getConversationId();
            messagingTemplate.convertAndSend(destination, savedMessage);
            
            log.info("Message broadcasted to {}", destination);
            
        } catch (AccessDeniedException e) {
            log.warn("Access denied for message from {} ID: {} to conversation ID: {} - {}", 
                    request.getSenderType(), request.getSenderId(), request.getConversationId(), e.getMessage());
            
            // Gửi error message về cho client qua error topic
            WebSocketErrorDto error = WebSocketErrorDto.builder()
                    .error("ACCESS_DENIED")
                    .message(e.getMessage())
                    .conversationId(request.getConversationId())
                    .timestamp(Instant.now().toEpochMilli())
                    .build();
            
            String errorDestination = "/topic/chat." + request.getConversationId() + ".errors";
            messagingTemplate.convertAndSend(errorDestination, error);
            
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage(), e);
            
            // Gửi error message về cho client
            WebSocketErrorDto error = WebSocketErrorDto.builder()
                    .error("ERROR")
                    .message("Không thể gửi tin nhắn: " + e.getMessage())
                    .conversationId(request.getConversationId())
                    .timestamp(Instant.now().toEpochMilli())
                    .build();
            
            String errorDestination = "/topic/chat." + request.getConversationId() + ".errors";
            messagingTemplate.convertAndSend(errorDestination, error);
        }
    }
    
    /**
     * Xử lý khi user connect (optional)
     * Có thể dùng để track online users, gửi thông báo, etc.
     */
    // @MessageMapping("/chat.connect")
    // public void handleConnect(@Payload Map<String, Object> connectData) {
    //     log.info("User connected: {}", connectData);
    // }
    
    /**
     * Xử lý khi user disconnect (optional)
     * Có thể dùng để cập nhật trạng thái offline, etc.
     */
    // @MessageMapping("/chat.disconnect")
    // public void handleDisconnect(@Payload Map<String, Object> disconnectData) {
    //     log.info("User disconnected: {}", disconnectData);
    // }
}










