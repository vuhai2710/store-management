package com.storemanagement.config;

import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration for Real-time Chat
 * 
 * Cấu hình WebSocket sử dụng STOMP protocol
 * 
 * Architecture:
 * - Client connects to /ws endpoint (with SockJS fallback)
 * - Client sends messages to /app/* destinations (handled by @MessageMapping)
 * - Server broadcasts messages to /topic/* destinations (subscribed by clients)
 * 
 * Message Flow:
 * 1. Client -> /app/chat.send -> @MessageMapping("/chat.send") in controller
 * 2. Controller processes and broadcasts -> /topic/chat.{conversationId}
 * 3. All subscribers to /topic/chat.{conversationId} receive message
 * 
 * CORS Configuration:
 * - Customer frontend: http://localhost:3003
 * - Admin/Employee frontend: http://localhost:3000
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    private final WebSocketAuthInterceptor webSocketAuthInterceptor;
    
    /**
     * Configure message broker
     * 
     * - enableSimpleBroker("/topic"): Messages sent to /topic/* will be routed to all subscribers
     * - setApplicationDestinationPrefixes("/app"): Messages from client to /app/* will be routed to @MessageMapping
     */
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // Enable simple in-memory message broker
        // Messages sent to /topic/* will be broadcast to all subscribed clients
        registry.enableSimpleBroker("/topic");
        
        // Application destination prefix
        // Client sends messages to /app/*, which are handled by @MessageMapping controllers
        registry.setApplicationDestinationPrefixes("/app");
    }
    
    /**
     * Register STOMP endpoints
     * 
     * - /ws: WebSocket connection endpoint
     * - withSockJS(): Enable SockJS fallback for browsers without WebSocket support
     * - setAllowedOriginPatterns("*"): Allow connections from all origins (for development)
     *   In production, specify exact origins: http://localhost:3000, http://localhost:3003
     */
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:3003")
                .addInterceptors(new WebSocketHandshakeInterceptor())
                .withSockJS(); // Enable SockJS fallback
    }
    
    /**
     * Configure client inbound channel với authentication interceptor
     */
    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
    }
}














