package com.storemanagement.controller;

import com.nimbusds.jose.JOSEException;
import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.request.LoginRequestDto;
import com.storemanagement.dto.response.AuthenticationResponseDto;
import com.storemanagement.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API liên quan đến xác thực (Authentication)
 * Base URL: /api/v1/auth
 * 
 * Tất cả các endpoint trong controller này đều PUBLIC (không cần authentication)
 * 
 * @author Store Management Team
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authService;

    /**
     * Đăng ký tài khoản khách hàng mới
     * 
     * Endpoint: POST /api/v1/auth/register
     * Authentication: Không cần (PUBLIC)
     * 
     * Request Body (JSON):
     * {
     *   "username": "string (required, min 4 chars)",
     *   "password": "string (required, min 4 chars)",
     *   "email": "string (required, valid email format)",
     *   "customerName": "string (required)",
     *   "phoneNumber": "string (required, valid phone format)",
     *   "address": "string (optional)"
     * }
     * 
     * Response:
     * {
     *   "code": 201,
     *   "message": "Đăng ký thành công",
     *   "data": {
     *     "token": "JWT token string",
     *     "refreshToken": "refresh token string",
     *     "user": { UserDto object }
     *   }
     * }
     * 
     * @param request AuthenticationRequestDto chứa thông tin đăng ký
     * @return ApiResponse chứa JWT token và thông tin user
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthenticationResponseDto>> register(
            @RequestBody @Valid AuthenticationRequestDto request) throws JOSEException {
        AuthenticationResponseDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công", response));
    }

    /**
     * Đăng nhập vào hệ thống
     * 
     * Endpoint: POST /api/v1/auth/login
     * Authentication: Không cần (PUBLIC)
     * 
     * Request Body (JSON):
     * {
     *   "username": "string (required, min 4 chars)",
     *   "password": "string (required, min 4 chars)"
     * }
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Đăng nhập thành công",
     *   "data": {
     *     "token": "JWT token string - Sử dụng trong Header: Authorization: Bearer {token}",
     *     "refreshToken": "refresh token string",
     *     "user": { UserDto object với thông tin user }
     *   }
     * }
     * 
     * Lưu ý: Sau khi đăng nhập thành công, cần lưu token và gửi kèm trong header:
     * Authorization: Bearer {token}
     * cho tất cả các request sau đó (trừ các endpoint PUBLIC)
     * 
     * @param request LoginRequestDto chứa username và password
     * @return ApiResponse chứa JWT token và thông tin user
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponseDto>> login(
            @RequestBody @Valid LoginRequestDto request) throws JOSEException {
        AuthenticationResponseDto response = authService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    /**
     * Đăng xuất khỏi hệ thống
     * 
     * Endpoint: POST /api/v1/auth/logout
     * Authentication: Không cần (PUBLIC)
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Đăng xuất thành công",
     *   "data": null
     * }
     * 
     * Lưu ý: Với JWT stateless, logout chủ yếu xử lý ở phía client (xóa token khỏi localStorage/sessionStorage).
     * Frontend cần xóa token sau khi gọi endpoint này.
     * 
     * @return ApiResponse với message thành công
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Với JWT stateless, logout chủ yếu xử lý ở phía client (xóa token)
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }
}
