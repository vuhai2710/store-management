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

/**
 * Configuration class để khởi tạo dữ liệu ban đầu khi ứng dụng khởi động
 * 
 * Chức năng:
 * - Tự động tạo tài khoản ADMIN mặc định nếu chưa tồn tại
 * - Chạy một lần khi ứng dụng start lần đầu
 * 
 * Lưu ý:
 * - Chỉ tạo ADMIN nếu chưa có username "admin" trong database
 * - Password được hash bằng BCrypt trước khi lưu
 * - Log thông tin đăng nhập để developer biết cách đăng nhập
 * 
 * CẢNH BÁO: 
 * - Trong production, nên đổi password ngay sau lần đăng nhập đầu tiên
 * - Hoặc disable class này và tạo admin thủ công
 * 
 * @author Store Management Team
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppInitConfig implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Thông tin tài khoản ADMIN mặc định
     * CẢNH BÁO: Đổi password trong production!
     */
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin";
    private static final String ADMIN_EMAIL = "admin@gmail.com";

    /**
     * Chạy khi ứng dụng khởi động
     * 
     * Logic:
     * 1. Kiểm tra xem đã có user với username "admin" chưa
     * 2. Nếu chưa có -> tạo mới với role ADMIN
     * 3. Nếu đã có -> bỏ qua (không tạo lại)
     * 
     * @param args Application arguments (không sử dụng)
     */
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
