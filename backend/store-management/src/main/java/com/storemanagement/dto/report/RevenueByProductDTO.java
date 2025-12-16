package com.storemanagement.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Revenue by product DTO
 * Shows sales performance per product.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueByProductDTO {

    private Integer productId;
    private String productCode;
    private String productName;
    private String categoryName;

    /**
     * Total quantity sold
     */
    private Long quantitySold;

    /**
     * Product revenue = SUM(quantity * price)
     */
    private BigDecimal productRevenue;

    /**
     * Allocated discount per product (proportional)
     */
    private BigDecimal discount;

    /**
     * Net revenue = productRevenue - discount
     */
    private BigDecimal netRevenue;

    /**
     * Average selling price
     */
    private BigDecimal avgSellingPrice;
}
