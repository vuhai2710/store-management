package com.storemanagement.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Revenue Summary DTO
 * Contains all financial metrics for a given date range.
 * 
 * Business Definitions:
 * - productRevenue: SUM(quantity * price) from COMPLETED orders
 * - totalDiscount: SUM(discount) from COMPLETED orders
 * - netRevenue: productRevenue - totalDiscount
 * - importCost: SUM(quantity * import_price) from purchase_orders
 * - grossProfit: netRevenue - importCost
 * - shippingFeeTotal: For reference only, NOT included in revenue
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueSummaryDTO {

    // === Revenue Metrics ===
    /**
     * Doanh thu bán hàng = SUM(quantity * price) from COMPLETED orders
     * EXCLUDES shipping fee
     */
    private BigDecimal productRevenue;

    /**
     * Tổng giảm giá = SUM(discount) from COMPLETED orders
     * Includes auto promotion + manual product promotion
     * EXCLUDES shipping promotion
     */
    private BigDecimal totalDiscount;

    /**
     * Doanh thu thuần = productRevenue - totalDiscount
     */
    private BigDecimal netRevenue;

    /**
     * Giá vốn = Estimated import cost based on sold products
     * Calculated from purchase_order_details
     */
    private BigDecimal importCost;

    /**
     * Lợi nhuận gộp = netRevenue - importCost
     */
    private BigDecimal grossProfit;

    // === Order Counts ===
    private Long totalOrders;
    private Long completedOrders;
    private Long canceledOrders;
    private Long pendingOrders;
    private Long confirmedOrders;

    // === Return/Exchange Stats ===
    private Long returnedOrders;
    private BigDecimal refundAmount;

    // === Shipping (Reference Only) ===
    /**
     * Phí vận chuyển (chỉ để tham khảo)
     * NOT included in revenue or profit calculations
     */
    private BigDecimal shippingFeeTotal;

    // === Period Info ===
    private String fromDate;
    private String toDate;
    private String groupBy;
}
