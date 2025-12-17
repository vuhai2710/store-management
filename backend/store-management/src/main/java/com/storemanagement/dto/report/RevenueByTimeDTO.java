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
public class RevenueByTimeDTO {

    private String time;

    private BigDecimal productRevenue;

    private BigDecimal totalDiscount;

    private BigDecimal netRevenue;

    private Long orderCount;
}
