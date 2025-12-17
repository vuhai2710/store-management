package com.storemanagement.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueByProductDTO {

    private Integer productId;
    private String productCode;
    private String productName;
    private String categoryName;

    private Long quantitySold;

    private BigDecimal productRevenue;

    private BigDecimal discount;

    private BigDecimal netRevenue;

    private BigDecimal avgSellingPrice;
}
