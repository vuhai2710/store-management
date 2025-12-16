package com.storemanagement.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Revenue by time period DTO
 * Used for charting net revenue over time.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueByTimeDTO {

    /**
     * Time period label (e.g., "2025-01", "2025-01-15", "2025")
     */
    private String time;

    /**
     * Product revenue for this period
     */
    private BigDecimal productRevenue;

    /**
     * Total discount for this period
     */
    private BigDecimal totalDiscount;

    /**
     * Net revenue for this period
     */
    private BigDecimal netRevenue;

    /**
     * Number of completed orders in this period
     */
    private Long orderCount;
}
