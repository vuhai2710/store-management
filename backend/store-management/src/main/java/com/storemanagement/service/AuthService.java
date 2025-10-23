package com.storemanagement.service;

import com.storemanagement.dto.LoginRequest;
import com.storemanagement.dto.LoginResponse;
import com.storemanagement.dto.RegisterRequest;
import com.storemanagement.entity.User;
import com.storemanagement.exception.BadRequestException;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Username hoặc password không đúng"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Username hoặc password không đúng");
        }
        
        if (!user.getIsActive()) {
            throw new BadRequestException("Tài khoản đã bị vô hiệu hóa");
        }
        
        String token = jwtUtil.generateToken(user.getUsername());
        
        return new LoginResponse(
                token,
                user.getIdUser(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }
    
    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username đã tồn tại");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        try {
            user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Role không hợp lệ");
        }
        
        user.setIsActive(true);
        
        return userRepository.save(user);
    }
}
