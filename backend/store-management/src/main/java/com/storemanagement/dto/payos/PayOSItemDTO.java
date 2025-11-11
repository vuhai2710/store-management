package com.storemanagement.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho PayOS Item (sản phẩm trong đơn hàng)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOSItemDTO {
    
    private String name;
    
    private Integer quantity;
    
    private BigDecimal price;
}
