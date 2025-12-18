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

        if (userRepository.findByUsername(ADMIN_USERNAME).isPresent()) {
            log.info("Admin user already exists, skipping creation");
            return;
        }

        User admin = User.builder()
                .username(ADMIN_USERNAME)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .email(ADMIN_EMAIL)
                .role(Role.ADMIN)
                .isActive(true)
                .build();

        userRepository.save(admin);

        log.warn("=========================================");
        log.warn("TÀI KHOẢN ADMIN ĐÃ ĐƯỢC TẠO:");
        log.warn("   Username: {}", ADMIN_USERNAME);
        log.warn("   Password: {}", ADMIN_PASSWORD);
        log.warn("   Email: {}", ADMIN_EMAIL);
        log.warn("=========================================");
        log.warn("CẢNH BÁO: Đổi password trong production!");
    }
}
