package com.storemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailDto {
    private Integer idOrderDetail;

    private Integer idProduct;
    private String productName;
    private String productCode;
    private String sku;
    
    // Snapshot fields - thông tin tại thời điểm mua
    private String productNameSnapshot;
    private String productCodeSnapshot;
    private String productImageSnapshot;

    private Integer quantity;
    private BigDecimal price; // Giá tại thời điểm mua

    private BigDecimal subtotal; // quantity * price
}




