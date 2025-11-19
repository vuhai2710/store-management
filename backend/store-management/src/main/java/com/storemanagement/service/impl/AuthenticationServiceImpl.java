package com.storemanagement.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.auth.LoginDTO;
import com.storemanagement.dto.auth.AuthenticationResponseDTO;
import com.storemanagement.dto.user.UserDTO;
import com.storemanagement.model.Employee;
import com.storemanagement.model.User;
import com.storemanagement.repository.EmployeeRepository;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.AuthenticationService;
import com.storemanagement.service.EmailService;
import com.storemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserService userService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

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
    public String forgotPassword(String email) {
        log.info("Processing forgot password for email: {}", email);
        
        // Bước 1: Tìm user theo email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email: " + email));
        
        // Bước 2: Generate random password
        String newPassword = generateRandomPassword(10);
        log.info("Generated new password for user: {}", user.getUsername());
        
        // Bước 3: Hash và update password
        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(hashedPassword);
        userRepository.save(user);
        log.info("Updated password for user: {}", user.getUsername());
        
        // Bước 4: Gửi email
        try {
            emailService.sendForgotPasswordEmail(email, user.getUsername(), newPassword);
            log.info("Sent forgot password email to: {}", email);
        } catch (Exception e) {
            log.error("Error sending forgot password email: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
        
        return "Mật khẩu mới đã được gửi đến email: " + email;
    }

    private String generateRandomPassword(int length) {
        if (length < 8) {
            length = 8; // Tối thiểu 8 ký tự để đảm bảo bảo mật
        }
        
        String upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowerCase = "abcdefghijklmnopqrstuvwxyz";
        String numbers = "0123456789";
        String allChars = upperCase + lowerCase + numbers;
        
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(length);
        
        // Đảm bảo có ít nhất 1 ký tự mỗi loại
        password.append(upperCase.charAt(random.nextInt(upperCase.length())));
        password.append(lowerCase.charAt(random.nextInt(lowerCase.length())));
        password.append(numbers.charAt(random.nextInt(numbers.length())));
        
        // Fill remaining characters
        for (int i = 3; i < length; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }
        
        // Shuffle để random vị trí
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }
        
        return new String(passwordArray);
    }
}
