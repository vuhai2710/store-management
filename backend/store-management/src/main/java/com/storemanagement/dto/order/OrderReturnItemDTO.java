package com.storemanagement.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderReturnItemDTO {
    private Integer idReturnItem;
    private Integer idOrderDetail;
    private Integer quantity;

    private String productName;
    private BigDecimal price;

    private Integer exchangeProductId;
    private Integer exchangeQuantity;

    private BigDecimal lineRefundAmount;
}
