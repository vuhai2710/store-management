package com.storemanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDto {
    private Integer idCart;
    private Integer idCustomer;
    private List<CartItemDto> cartItems;
    private BigDecimal totalAmount;
    private Integer totalItems;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}

