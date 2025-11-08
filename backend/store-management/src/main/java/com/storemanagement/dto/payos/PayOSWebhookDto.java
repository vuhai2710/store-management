package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho PayOS Webhook Callback
 * 
 * Mục đích:
 * - Mapping webhook request body từ PayOS khi có sự kiện thanh toán
 * - PayOS gửi POST request đến webhook URL với body này
 * 
 * Cấu trúc webhook từ PayOS:
 * {
 *   "code": "00",
 *   "desc": "success",
 *   "data": {
 *     "orderCode": 123456,
 *     "amount": 100000,
 *   "description": "...",
 *     "accountNumber": "1234567890",
 *     "reference": "PAYOS-123456",
 *     "transactionDateTime": "2024-01-01T10:00:00Z",
 *     "currency": "VND",
 *     "paymentLinkId": "abc123",
 *     "code": "00",
 *     "desc": "success"
 *   },
 *   "signature": "HMAC_SHA256_SIGNATURE"
 * }
 * 
 * Lưu ý quan trọng:
 * - Phải verify signature trước khi xử lý webhook
 * - Signature được tạo bằng HMAC SHA256 với checksumKey
 * - Data để verify là JSON string của request body (không format)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSWebhookDto {
    
    /**
     * Response code từ PayOS
     * "00" = thanh toán thành công
     * Các mã khác = thanh toán thất bại hoặc lỗi
     */
    private String code;
    
    /**
     * Response description
     */
    private String desc;
    
    /**
     * Webhook data chứa thông tin thanh toán
     */
    private PayOSWebhookDataDto data;
    
    /**
     * HMAC SHA256 signature
     * Bắt buộc phải verify signature để đảm bảo webhook đến từ PayOS thật
     * Algorithm: HMAC SHA256
     * Key: checksumKey từ PayOSConfig
     * Data: JSON string của request body (không format, không có whitespace)
     */
    private String signature;
}

