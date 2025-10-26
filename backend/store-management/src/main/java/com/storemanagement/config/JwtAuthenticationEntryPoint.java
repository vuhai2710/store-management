package com.storemanagement.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        // 401 UNAUTHORIZED
        ApiResponse<Void> errorResponse = ApiResponse.error(
                401,
                "Yêu cầu đăng nhập"
        );

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getWriter(), errorResponse);
    }
}
