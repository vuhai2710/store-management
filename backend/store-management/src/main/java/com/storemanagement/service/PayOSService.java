package com.storemanagement.service;

import com.storemanagement.dto.payos.PayOSPaymentResponseDto;
import com.storemanagement.model.Order;

/**
 * Service interface cho PayOS Payment Gateway integration
 * 
 * Mục đích:
 * - Cung cấp các method để tương tác với PayOS API
 * - Tạo payment link, verify webhook, lấy thông tin payment link
 * 
 * PayOS API Documentation: https://payos.vn/docs/api/
 */
public interface PayOSService {
    
    /**
     * Tạo payment link từ PayOS API
     * 
     * Logic:
     * 1. Build PayOSPaymentRequestDto từ Order entity
     * 2. Gọi PayOS API POST /v2/payment-requests để tạo payment link
     * 3. Parse response và trả về PayOSPaymentResponseDto
     * 4. Payment link URL sẽ được trả về trong response.data.checkoutUrl
     * 
     * @param order Order entity cần tạo payment link
     * @return PayOSPaymentResponseDto chứa payment link URL và payment link ID
     * @throws RuntimeException nếu gọi PayOS API thất bại
     */
    PayOSPaymentResponseDto createPaymentLink(Order order);
    
    /**
     * Xác thực webhook signature từ PayOS
     * 
     * Logic:
     * 1. PayOS gửi webhook với HMAC SHA256 signature
     * 2. Generate signature từ request body và checksumKey
     * 3. So sánh signature từ PayOS với signature đã generate
     * 4. Return true nếu khớp, false nếu không khớp
     * 
     * Algorithm: HMAC SHA256
     * Key: checksumKey từ PayOSConfig
     * Data: JSON string của request body (không format, không có whitespace)
     * 
     * @param data JSON string của request body (không format)
     * @param signature HMAC signature từ PayOS (trong header hoặc body)
     * @return true nếu signature hợp lệ, false nếu không hợp lệ
     */
    boolean verifyWebhookSignature(String data, String signature);
    
    /**
     * Lấy thông tin payment link từ PayOS
     * 
     * Logic:
     * 1. Gọi PayOS API GET /v2/payment-requests/{paymentLinkId}
     * 2. Parse response và trả về thông tin payment link
     * 
     * @param paymentLinkId PayOS payment link ID
     * @return PayOSPaymentResponseDto chứa thông tin payment link
     * @throws RuntimeException nếu gọi PayOS API thất bại
     */
    PayOSPaymentResponseDto getPaymentLinkInfo(String paymentLinkId);
    
    /**
     * Hủy payment link trên PayOS
     * 
     * Logic:
     * 1. Gọi PayOS API DELETE /v2/payment-requests/{paymentLinkId}
     * 2. Payment link sẽ không còn sử dụng được
     * 
     * @param paymentLinkId PayOS payment link ID
     * @throws RuntimeException nếu gọi PayOS API thất bại
     */
    void cancelPaymentLink(String paymentLinkId);
}













