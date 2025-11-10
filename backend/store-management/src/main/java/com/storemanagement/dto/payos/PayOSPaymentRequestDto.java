package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO cho PayOS Payment Link Creation Request
 * 
 * Mục đích:
 * - Mapping request body khi gọi PayOS API để tạo payment link
 * - Theo cấu trúc API của PayOS: https://payos.vn/docs/api/
 * 
 * Các trường quan trọng:
 * - orderCode: Mã đơn hàng (unique, dùng orderId)
 * - amount: Số tiền thanh toán (đơn vị: VND)
 * - description: Mô tả đơn hàng
 * - items: Danh sách sản phẩm trong đơn hàng
 * - cancelUrl: URL redirect khi hủy thanh toán
 * - returnUrl: URL redirect sau khi thanh toán thành công
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSPaymentRequestDto {
    
    /**
     * Mã đơn hàng (orderCode)
     * PayOS yêu cầu orderCode phải là số nguyên dương và unique
     * Sử dụng orderId từ database
     */
    private Long orderCode;
    
    /**
     * Số tiền thanh toán (đơn vị: VND)
     * Phải khớp với finalAmount của order
     */
    private BigDecimal amount;
    
    /**
     * Mô tả đơn hàng
     * Hiển thị trên payment page của PayOS
     */
    private String description;
    
    /**
     * Danh sách sản phẩm trong đơn hàng
     * Optional - PayOS có thể yêu cầu hoặc không
     */
    private List<PayOSItemDto> items;
    
    /**
     * URL redirect sau khi thanh toán thành công
     * PayOS sẽ redirect user về URL này
     */
    private String returnUrl;
    
    /**
     * URL redirect khi user hủy thanh toán
     * PayOS sẽ redirect user về URL này
     */
    private String cancelUrl;
}

















