package com.storemanagement.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * CartItemDTO không kế thừa BaseDTO vì CartItem entity không có timestamps
 */
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
}
