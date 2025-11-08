package com.storemanagement.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration class cho PayOS Payment Gateway
 * 
 * Mục đích:
 * - Đọc và quản lý cấu hình PayOS từ application.yaml
 * - Bind các properties từ payos.* trong application.yaml vào các fields
 * - Cung cấp RestTemplate bean cho PayOSService
 * 
 * Sử dụng:
 * - Inject PayOSConfig vào các service cần sử dụng PayOS credentials
 * - Cung cấp các giá trị cấu hình như Client ID, API Key, URLs, etc.
 * 
 * Lưu ý:
 * - Các giá trị được đọc từ application.yaml
 * - Cần cập nhật credentials sau khi đăng ký tài khoản PayOS
 */
@Configuration
@ConfigurationProperties(prefix = "payos")
@Data
public class PayOSConfig {
    
    /**
     * RestTemplate bean để gọi PayOS API
     * Sử dụng để thực hiện HTTP requests đến PayOS API
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    /**
     * Client ID từ PayOS dashboard
     * Lấy từ: https://my.payos.vn → API Keys
     */
    private String clientId;
    
    /**
     * API Key từ PayOS dashboard
     * Sử dụng để authenticate khi gọi PayOS API
     */
    private String apiKey;
    
    /**
     * Checksum Key từ PayOS dashboard
     * Sử dụng để verify HMAC signature của webhook từ PayOS
     * Bắt buộc phải verify signature để đảm bảo webhook đến từ PayOS thật
     */
    private String checksumKey;
    
    /**
     * Webhook URL để nhận callback từ PayOS
     * PayOS sẽ gửi POST request đến URL này khi có sự kiện thanh toán
     * Phải là HTTPS (không chấp nhận HTTP)
     * Local development: Sử dụng ngrok để expose local server
     */
    private String webhookUrl;
    
    /**
     * Return URL - URL redirect sau khi thanh toán thành công
     * PayOS sẽ redirect user về URL này sau khi thanh toán thành công
     * Frontend URL: http://localhost:3000/payment/success
     */
    private String returnUrl;
    
    /**
     * Cancel URL - URL redirect khi user hủy thanh toán
     * PayOS sẽ redirect user về URL này khi user hủy thanh toán
     * Frontend URL: http://localhost:3000/payment/cancel
     */
    private String cancelUrl;
    
    /**
     * Environment: sandbox hoặc production
     * - sandbox: Môi trường test, không cần thẻ thật
     * - production: Môi trường thật, cần thẻ thật
     */
    private String environment;
    
    /**
     * Base URL của PayOS API
     * - Sandbox: https://api-merchant.payos.vn
     * - Production: https://api-merchant.payos.vn (hoặc URL production từ PayOS)
     */
    private String baseUrl;
}

