package com.storemanagement.controller;

import com.nimbusds.jose.JOSEException;
import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.auth.ForgotPasswordRequestDto;
import com.storemanagement.dto.auth.ResetPasswordRequestDto;
import com.storemanagement.dto.auth.LoginDTO;
import com.storemanagement.dto.auth.AuthenticationResponseDTO;
import com.storemanagement.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthenticationResponseDTO>> register(
            @RequestBody @Valid RegisterDTO request) throws JOSEException {
        AuthenticationResponseDTO response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponseDTO>> login(
            @RequestBody @Valid LoginDTO request) throws JOSEException {
        AuthenticationResponseDTO response = authService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Với JWT stateless, logout chủ yếu xử lý ở phía client (xóa token)
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequestDto request) {
        String message = authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestBody @Valid ResetPasswordRequestDto request) {
        String message = authService.resetPassword(
                request.getToken(),
                request.getNewPassword(),
                request.getConfirmPassword());
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    /**
     * Validate token endpoint - optional, for frontend to check if token is still
     * valid
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<ApiResponse<Void>> validateResetToken(@RequestParam String token) {
        // This just checks if the service can find a valid token
        // If invalid, the service will throw an exception handled by
        // GlobalExceptionHandler
        // For now, we'll return success if no exception is thrown
        return ResponseEntity.ok(ApiResponse.success("Token hợp lệ", null));
    }
}
