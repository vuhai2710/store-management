package com.storemanagement.config;

import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * *** FIX CORS QUAN TRỌNG ***
     * WebSocket cũng cần CORS, nếu chặn origin → Render reset toàn bộ preflight OPTION
     * làm FE báo lỗi “Network Error” khi login.
     *
     * => Bản sửa này cho phép domain thật: Vercel + localhost + *.vercel.app
     */
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "https://store-admin-xi.vercel.app",
                        "https://store-client-xi.vercel.app",
                        "https://*.vercel.app",
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:3003",
                        "*"
                )
                .addInterceptors(new WebSocketHandshakeInterceptor())
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
    }
}
