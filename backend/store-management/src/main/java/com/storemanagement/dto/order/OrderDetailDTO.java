package com.storemanagement.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * OrderDetailDTO không kế thừa BaseDTO vì OrderDetail entity không có timestamps
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailDTO {
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
    
    // Fields từ OrderItemDto (request)
    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer productId; // Dùng khi tạo đơn hàng
    
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantityForCreate; // Dùng khi tạo đơn hàng
}
