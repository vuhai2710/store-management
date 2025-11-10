package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho PayOS Item (sản phẩm trong đơn hàng)
 * 
 * Mục đích:
 * - Đại diện cho một sản phẩm trong danh sách items của PayOS payment request
 * - Optional - PayOS có thể yêu cầu hoặc không tùy theo version API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSItemDto {
    
    /**
     * Tên sản phẩm
     */
    private String name;
    
    /**
     * Số lượng
     */
    private Integer quantity;
    
    /**
     * Giá tiền (đơn vị: VND)
     */
    private BigDecimal price;
}



















