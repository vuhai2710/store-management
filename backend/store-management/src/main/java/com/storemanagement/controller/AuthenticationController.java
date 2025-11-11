package com.storemanagement.controller;

import com.nimbusds.jose.JOSEException;
import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.auth.ForgotPasswordRequestDto;
import com.storemanagement.dto.auth.LoginDTO;
import com.storemanagement.dto.auth.AuthenticationResponseDTO;
import com.storemanagement.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<ApiResponse<AuthenticationResponseDTO>> register(
            @RequestBody @Valid RegisterDTO request) throws JOSEException {
        AuthenticationResponseDTO response = authService.register(request);
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
     * @param request LoginDTO chứa username và password
     * @return ApiResponse chứa JWT token và thông tin user
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponseDTO>> login(
            @RequestBody @Valid LoginDTO request) throws JOSEException {
        AuthenticationResponseDTO response = authService.authenticate(request);
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

    /**
     * Quên mật khẩu - Gửi mật khẩu mới qua email
     * 
     * Endpoint: POST /api/v1/auth/forgot-password
     * Authentication: Không cần (PUBLIC)
     * 
     * Request Body (JSON):
     * {
     *   "email": "string (required, valid email)"
     * }
     * 
     * Flow xử lý:
     * 1. Tìm tài khoản theo email
     * 2. Generate mật khẩu mới ngẫu nhiên (10 ký tự: chữ + số)
     * 3. Hash và update mật khẩu vào database
     * 4. Gửi email chứa mật khẩu mới cho user
     * 5. Return success message
     * 
     * Response thành công:
     * {
     *   "code": 200,
     *   "message": "Mật khẩu mới đã được gửi đến email: user@example.com",
     *   "data": null
     * }
     * 
     * Response lỗi:
     * - 404: Không tìm thấy tài khoản với email này
     * - 500: Không thể gửi email (lỗi SMTP)
     * 
     * Lưu ý:
     * - User nên đổi mật khẩu ngay sau khi đăng nhập
     * - Mật khẩu mới là random và chỉ gửi 1 lần qua email
     * - Email có thể mất vài giây để đến hộp thư
     * 
     * @param request ForgotPasswordRequestDto chứa email
     * @return ApiResponse với message thành công
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequestDto request) {
        String message = authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }
}
