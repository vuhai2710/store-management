package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho PayOS Payment Data (phần data trong response)
 * 
 * Mục đích:
 * - Chứa thông tin chi tiết về payment link được tạo
 * - Bao gồm paymentLinkId và checkoutUrl (payment link URL)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSPaymentDataDto {
    
    /**
     * PayOS payment link ID
     * Sử dụng để:
     * 1. Lưu vào order.paymentLinkId để tracking
     * 2. Tìm order khi nhận webhook (webhook gửi payment_link_id)
     */
    private String paymentLinkId;
    
    /**
     * Payment link URL (checkoutUrl)
     * URL để user thanh toán trên PayOS
     * Frontend sẽ redirect user đến URL này hoặc hiển thị QR code
     */
    private String checkoutUrl;
    
    /**
     * QR Code (nếu có)
     * PayOS có thể trả về QR code để scan
     */
    private String qrCode;
    
    /**
     * Order code (orderId)
     */
    private Long orderCode;
    
    /**
     * Số tiền
     */
    private BigDecimal amount;
    
    /**
     * Mô tả
     */
    private String description;
    
    /**
     * Trạng thái payment link
     * PENDING, PAID, CANCELLED, etc.
     */
    private String status;
}













