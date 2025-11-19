package com.storemanagement.config;

import com.storemanagement.model.User;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.utils.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
//@RequiredArgsConstructor
@Slf4j
public class AppInitConfig implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AppInitConfig(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin";
    private static final String ADMIN_EMAIL = "admin@gmail.com";


    @Override
    public void run(ApplicationArguments args) {
        // Kiểm tra xem đã có admin chưa
        if (userRepository.findByUsername(ADMIN_USERNAME).isPresent()) {
            log.info("Admin user already exists, skipping creation");
            return;
        }

        // Tạo user ADMIN mới
        User admin = User.builder()
                .username(ADMIN_USERNAME)
                .password(passwordEncoder.encode(ADMIN_PASSWORD)) // Hash password trước khi lưu
                .email(ADMIN_EMAIL)
                .role(Role.ADMIN)
                .isActive(true) // Mặc định active
                .build();

        // Lưu vào database
        userRepository.save(admin);

        // Log thông tin để developer biết cách đăng nhập
        log.warn("=========================================");
        log.warn("TÀI KHOẢN ADMIN ĐÃ ĐƯỢC TẠO:");
        log.warn("   Username: {}", ADMIN_USERNAME);
        log.warn("   Password: {}", ADMIN_PASSWORD);
        log.warn("   Email: {}", ADMIN_EMAIL);
        log.warn("=========================================");
        log.warn("CẢNH BÁO: Đổi password trong production!");
    }
}
