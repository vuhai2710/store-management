package com.storemanagement.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {
    private Integer idCartItem;
    private Integer idProduct;
    private String productName;
    private String productCode;
    private String productImageUrl;
    private BigDecimal productPrice;
    private Integer productStockQuantity;
    private Integer quantity;
    private BigDecimal subtotal; // quantity * productPrice

    // Các trường bên dưới chỉ dùng để hiển thị giá sau giảm trong giỏ hàng
    private BigDecimal discountedUnitPrice; // Đơn giá sau khi phân bổ giảm giá tự động
    private BigDecimal discountedSubtotal;  // Thành tiền sau giảm cho dòng này
    private BigDecimal discountAmount;      // Số tiền giảm của dòng này
}
