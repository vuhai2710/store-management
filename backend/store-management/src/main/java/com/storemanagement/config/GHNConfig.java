package com.storemanagement.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration class cho GHN (Giao Hàng Nhanh) API Integration
 * 
 * Mục đích:
 * - Đọc và quản lý cấu hình GHN từ application.yaml
 * - Bind các properties từ ghn.* trong application.yaml vào các fields
 * - Cung cấp RestTemplate bean cho GHNService
 * 
 * Sử dụng:
 * - Inject GHNConfig vào các service cần sử dụng GHN credentials
 * - Cung cấp các giá trị cấu hình như Token, Shop ID, URLs, etc.
 * 
 * Lưu ý:
 * - Các giá trị được đọc từ application.yaml
 * - Cần cập nhật credentials sau khi đăng ký tài khoản GHN
 * - Môi trường DEV sử dụng GHN Sandbox: https://dev-online-gateway.ghn.vn
 */
@Configuration
@ConfigurationProperties(prefix = "ghn")
@Data
public class GHNConfig {
    
    /**
     * RestTemplate bean để gọi GHN API
     * Sử dụng để thực hiện HTTP requests đến GHN API
     */
    @Bean(name = "ghnRestTemplate")
    public RestTemplate ghnRestTemplate() {
        return new RestTemplate();
    }
    
    /**
     * Token API từ GHN
     * Lấy từ: https://khachhang.ghn.vn → Thông tin cá nhân → Token API
     * Token này được sử dụng để authenticate khi gọi GHN API
     */
    private String token;
    
    /**
     * Shop ID từ GHN
     * Lấy từ: https://khachhang.ghn.vn → Quản lý cửa hàng
     * Shop ID xác định cửa hàng của bạn trong hệ thống GHN
     */
    private Integer shopId;
    
    /**
     * Base URL của GHN API
     * - Sandbox (DEV): https://dev-online-gateway.ghn.vn
     * - Production: https://online-gateway.ghn.vn
     */
    private String baseUrl;
    
    /**
     * Webhook URL để nhận callback từ GHN
     * GHN sẽ gửi POST request đến URL này khi có cập nhật trạng thái đơn hàng
     * Phải là HTTPS (không chấp nhận HTTP)
     * Local development: Sử dụng ngrok để expose local server
     */
    private String webhookUrl;
    
    /**
     * Feature flag để bật/tắt GHN integration
     * - true: Sử dụng GHN API thật
     * - false: Bỏ qua GHN API, sử dụng mock/default values
     * Cho phép dễ dàng switch giữa mock và real GHN
     */
    private Boolean enabled = true;
    
    /**
     * Environment: sandbox hoặc production
     * - sandbox: Môi trường test, sử dụng GHN Sandbox API
     * - production: Môi trường thật, sử dụng GHN Production API
     */
    private String environment = "sandbox";
}










