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
public class CartItemDto {
    private Integer idCartItem;
    private Integer idProduct;
    private String productName;
    private String productCode;
    private String productImageUrl;
    private Double productPrice;
    private Integer productStockQuantity;
    private Integer quantity;
    private BigDecimal subtotal; // quantity * productPrice
}




