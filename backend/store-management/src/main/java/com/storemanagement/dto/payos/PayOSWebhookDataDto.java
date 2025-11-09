package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho PayOS Webhook Data (phần data trong webhook)
 * 
 * Mục đích:
 * - Chứa thông tin chi tiết về giao dịch thanh toán
 * - Sử dụng để cập nhật order status và lưu thông tin thanh toán
 * 
 * Các trường quan trọng:
 * - paymentLinkId: Dùng để tìm order tương ứng
 * - code: "00" = thành công, khác = thất bại
 * - amount: Số tiền đã thanh toán (để verify với order.finalAmount)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSWebhookDataDto {
    
    /**
     * PayOS payment link ID
     * Sử dụng để tìm order: SELECT * FROM orders WHERE payment_link_id = ?
     * PayOS webhook gửi payment_link_id này để identify order
     */
    private String paymentLinkId;
    
    /**
     * Order code (orderId)
     */
    private Long orderCode;
    
    /**
     * Số tiền đã thanh toán (đơn vị: VND)
     * Nên verify với order.finalAmount để đảm bảo đúng số tiền
     */
    private BigDecimal amount;
    
    /**
     * Mô tả
     */
    private String description;
    
    /**
     * Số tài khoản ngân hàng (nếu có)
     */
    private String accountNumber;
    
    /**
     * Reference code từ PayOS
     */
    private String reference;
    
    /**
     * Thời gian giao dịch
     */
    private LocalDateTime transactionDateTime;
    
    /**
     * Currency (VND)
     */
    private String currency;
    
    /**
     * Code trong data (thường giống với code ở root level)
     * "00" = thành công
     */
    private String code;
    
    /**
     * Description trong data
     */
    private String desc;
}








