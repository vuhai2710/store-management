package com.storemanagement.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.auth.LoginDTO;
import com.storemanagement.dto.auth.AuthenticationResponseDTO;
import com.storemanagement.dto.user.UserDTO;
import com.storemanagement.exception.InvalidTokenException;
import com.storemanagement.exception.ResourceNotFoundException;
import com.storemanagement.model.Employee;
import com.storemanagement.model.PasswordResetToken;
import com.storemanagement.model.User;
import com.storemanagement.repository.EmployeeRepository;
import com.storemanagement.repository.PasswordResetTokenRepository;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.AuthenticationService;
import com.storemanagement.service.EmailService;
import com.storemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserService userService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    @Value("${password-reset.token-expiry-minutes:30}")
    private int tokenExpiryMinutes;

    @Value("${password-reset.admin-url:http://localhost:3000/reset-password}")
    private String adminResetUrl;

    @Value("${password-reset.client-url:http://localhost:3001/reset-password}")
    private String clientResetUrl;

    // LOGIN
    public AuthenticationResponseDTO authenticate(LoginDTO request) throws JOSEException {
        User user = userService.verifyInfo(request.getUsername(), request.getPassword());
        String token = generateToken(user);

        return AuthenticationResponseDTO.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    // REGISTER
    public AuthenticationResponseDTO register(RegisterDTO request) throws JOSEException {
        UserDTO userDTO = userService.createCustomerUser(request);
        User user = userRepository.findById(userDTO.getIdUser())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        String token = generateToken(user);
        return AuthenticationResponseDTO.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    public String generateToken(User user) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        // Lấy employeeId nếu user là employee
        Optional<Integer> employeeIdOpt = Optional.empty();
        if ("EMPLOYEE".equals(user.getRole().name())) {
            employeeIdOpt = employeeRepository.findByUser_IdUser(user.getIdUser())
                    .map(Employee::getIdEmployee);
        }

        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("store-management.com")
                .expirationTime(Date.from(Instant.now().plus(24, ChronoUnit.HOURS)))
                .claim("role", user.getRole().name())
                .claim("idUser", user.getIdUser());

        // Chỉ thêm employeeId nếu user là employee
        employeeIdOpt.ifPresent(employeeId -> claimsBuilder.claim("employeeId", employeeId));

        JWTClaimsSet jwtClaimsSet = claimsBuilder.build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSSigner signer = new MACSigner(SIGNER_KEY.getBytes());
        JWSObject jwsObject = new JWSObject(header, payload);
        jwsObject.sign(signer);
        return jwsObject.serialize();
    }

    @Override
    @Transactional
    public String forgotPassword(String email) {
        log.info("Processing forgot password for email: {}", email);

        // Bước 1: Tìm user theo email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email: " + email));

        // Kiểm tra user có active không
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        // Bước 2: Vô hiệu hóa tất cả token cũ của user này
        passwordResetTokenRepository.invalidateAllTokensForUser(user);

        // Bước 3: Tạo reset token mới
        String resetToken = generateResetToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(tokenExpiryMinutes);

        PasswordResetToken tokenEntity = PasswordResetToken.builder()
                .user(user)
                .token(resetToken)
                .expiresAt(expiresAt)
                .used(false)
                .build();
        passwordResetTokenRepository.save(tokenEntity);
        log.info("Created password reset token for user: {}", user.getUsername());

        // Bước 4: Tạo reset link dựa trên role của user
        String resetLink = buildResetLink(user, resetToken);

        // Bước 5: Gửi email với link reset password
        try {
            emailService.sendPasswordResetEmail(email, user.getUsername(), resetLink, tokenExpiryMinutes);
            log.info("Sent password reset email to: {}", email);
        } catch (Exception e) {
            log.error("Error sending password reset email: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }

        return "Vui lòng kiểm tra email để đặt lại mật khẩu";
    }

    @Override
    @Transactional
    public String resetPassword(String token, String newPassword, String confirmPassword) {
        log.info("Processing password reset with token");

        // Validate password confirmation
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        // Find and validate token
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(token)
                .orElseThrow(() -> InvalidTokenException.invalid());

        // Check if token is already used
        if (resetToken.getUsed()) {
            throw InvalidTokenException.alreadyUsed();
        }

        // Check if token is expired
        if (resetToken.isExpired()) {
            throw InvalidTokenException.expired();
        }

        // Get user and update password
        User user = resetToken.getUser();
        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(hashedPassword);
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getUsername());

        return "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.";
    }

    /**
     * Generate a secure random token for password reset
     */
    private String generateResetToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Build reset link based on user role
     */
    private String buildResetLink(User user, String token) {
        String baseUrl;
        switch (user.getRole()) {
            case ADMIN:
            case EMPLOYEE:
                baseUrl = adminResetUrl;
                break;
            case CUSTOMER:
            default:
                baseUrl = clientResetUrl;
                break;
        }
        return baseUrl + "?token=" + token;
    }
}
