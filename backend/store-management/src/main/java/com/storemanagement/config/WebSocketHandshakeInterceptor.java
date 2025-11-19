package com.storemanagement.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * WebSocket Handshake Interceptor
 * <p>
 * Extract JWT token từ query parameter trong quá trình handshake
 * và lưu vào session attributes để sử dụng trong WebSocketAuthInterceptor
 */
@Slf4j
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;

            // Lấy token từ query parameter
            String token = servletRequest.getServletRequest().getParameter("token");

            if (token != null && !token.isEmpty()) {
                // Lưu token vào session attributes
                attributes.put("token", token);
                log.debug("Token extracted from query parameter and stored in session");
            } else {
                // Thử lấy từ header Authorization
                String authHeader = servletRequest.getServletRequest().getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                    attributes.put("token", token);
                    log.debug("Token extracted from Authorization header and stored in session");
                }
            }
        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No-op
    }
}

