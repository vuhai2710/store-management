package com.storemanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;
    private final JwtAuthenticationConverter jwtAuthenticationConverter;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Lấy token từ query parameter hoặc header
            String token = extractToken(accessor);

            if (token != null && !token.isEmpty()) {
                try {
                    // Validate và decode JWT token
                    Jwt jwt = jwtDecoder.decode(token);

                    // Convert JWT thành Authentication object
                    Authentication authentication = jwtAuthenticationConverter.convert(jwt);

                    // Set authentication vào session
                    accessor.setUser(authentication);

                    //  THÊM: Set authentication vào SecurityContext để SecurityUtils có thể lấy được
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.info("WebSocket authenticated for user: {}", authentication.getName());
                } catch (Exception e) {
                    log.error("WebSocket authentication failed: {}", e.getMessage());
                    // Reject connection nếu token không hợp lệ
                    throw new RuntimeException("Authentication failed: " + e.getMessage());
                }
            } else {
                log.warn("WebSocket connection attempt without token");
                throw new RuntimeException("Authentication token required");
            }
        }

        //  THÊM: Set authentication cho tất cả các message (không chỉ CONNECT)
        if (accessor != null && accessor.getUser() instanceof Authentication) {
            Authentication authentication = (Authentication) accessor.getUser();
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        return message;
    }

    /**
     * Extract JWT token từ query parameter hoặc STOMP header
     */
    private String extractToken(StompHeaderAccessor accessor) {
        // 1. Thử lấy từ query parameter (nativeHeaders chứa query params)
        Map<String, List<String>> nativeHeaders = accessor.toNativeHeaderMap();
        if (nativeHeaders != null) {
            List<String> tokenParams = nativeHeaders.get("token");
            if (tokenParams != null && !tokenParams.isEmpty()) {
                return tokenParams.get(0);
            }
        }

        // 2. Thử lấy từ STOMP header Authorization
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }

        // 3. Thử lấy từ session attributes (nếu đã set từ handshake)
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            Object tokenObj = sessionAttributes.get("token");
            if (tokenObj != null) {
                return tokenObj.toString();
            }
        }

        return null;
    }
}