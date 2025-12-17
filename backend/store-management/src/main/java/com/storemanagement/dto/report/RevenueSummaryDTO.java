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
public class RevenueSummaryDTO {

    private BigDecimal productRevenue;

    private BigDecimal totalDiscount;

    private BigDecimal netRevenue;

    private BigDecimal importCost;

    private BigDecimal grossProfit;

    private Long totalOrders;
    private Long completedOrders;
    private Long canceledOrders;
    private Long pendingOrders;
    private Long confirmedOrders;

    private Long returnedOrders;
    private BigDecimal refundAmount;

    private BigDecimal shippingFeeTotal;

    private String fromDate;
    private String toDate;
    private String groupBy;
}
