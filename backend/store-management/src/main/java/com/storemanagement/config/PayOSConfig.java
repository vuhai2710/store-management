package com.storemanagement.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

/**
 * Configuration class cho PayOS Payment Gateway
 *
 * Mục đích:
 * - Đọc và quản lý cấu hình PayOS từ application.yaml
 * - Bind các properties từ payos.* trong application.yaml vào các fields
 * - Cung cấp PayOS SDK instance cho PayOSService
 *
 * Sử dụng:
 * - Inject PayOSConfig vào các service cần sử dụng PayOS credentials
 * - Cung cấp các giá trị cấu hình như Client ID, API Key, URLs, etc.
 *
 * Lưu ý:
 * - Các giá trị được đọc từ application.yaml
 * - Cần cập nhật credentials sau khi đăng ký tài khoản PayOS
 * - PayOS SDK được khởi tạo với credentials từ config
 */
@Configuration
@ConfigurationProperties(prefix = "payos")
@Data
public class PayOSConfig {

    /**
     * PayOS SDK bean để gọi PayOS API
     * Sử dụng PayOS Java SDK thay vì RestTemplate
     *
     * SDK sẽ tự động xử lý:
     * - Authentication (Client ID, API Key)
     * - Request/Response serialization
     * - Error handling
     * - Environment (sandbox/production) được xác định từ credentials
     */
    @Bean
    public PayOS payOS() {
        if (clientId == null || apiKey == null || checksumKey == null) {
            throw new IllegalStateException("PayOS credentials are not configured. Please set payos.client-id, payos.api-key, and payos.checksum-key in application.yaml");
        }

        // PayOS SDK constructor: PayOS(clientId, apiKey, checksumKey)
        // Environment được xác định tự động từ credentials (sandbox credentials sẽ gọi sandbox API)
        return new PayOS(clientId, apiKey, checksumKey);
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

