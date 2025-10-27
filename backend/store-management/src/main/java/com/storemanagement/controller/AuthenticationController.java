package com.storemanagement.controller;

import com.nimbusds.jose.JOSEException;
import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.AuthenticationRequestDto;
import com.storemanagement.dto.AuthenticationResponseDto;
import com.storemanagement.dto.LoginRequestDto;
import com.storemanagement.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthenticationResponseDto>> register(
            @RequestBody @Valid AuthenticationRequestDto request) throws JOSEException {
        AuthenticationResponseDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponseDto>> login(
            @RequestBody @Valid LoginRequestDto request) throws JOSEException {
        AuthenticationResponseDto response = authService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Với JWT stateless, logout chủ yếu xử lý ở phía client (xóa token)
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }
}
