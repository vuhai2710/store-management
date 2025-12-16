package com.storemanagement.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Dashboard Overview DTO
 * Contains all KPIs for the admin dashboard.
 * 
 * IMPORTANT: Revenue = Products only (EXCLUDES shipping fee)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardOverviewDTO {

    // === Today KPIs ===
    /**
     * Net revenue of today (products only, excludes shipping)
     */
    private BigDecimal todayRevenue;

    /**
     * Number of orders created today (all statuses)
     */
    private Long ordersToday;

    /**
     * Number of completed orders today
     */
    private Long completedOrdersToday;

    // === Month KPIs ===
    /**
     * Net revenue of current month (products only, excludes shipping)
     */
    private BigDecimal monthRevenue;

    /**
     * Total orders this month
     */
    private Long ordersThisMonth;

    /**
     * Completed orders this month
     */
    private Long completedOrdersThisMonth;

    // === Return/Exchange ===
    /**
     * Count of active return/exchange requests (REQUESTED status)
     */
    private Long activeReturnRequests;

    // === Top Products ===
    private List<TopProductDTO> topProducts;

    // === Recent Orders ===
    private List<RecentOrderDTO> recentOrders;

    // === Trend Data (for mini chart) ===
    private List<DailyRevenueDTO> revenueChart;

    /**
     * Top selling product DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProductDTO {
        private Integer productId;
        private String productCode;
        private String productName;
        private String imageUrl;
        private Long quantitySold;
        private BigDecimal netRevenue;
    }

    /**
     * Recent order DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentOrderDTO {
        private Integer orderId;
        private String customerName;
        private String orderDate;
        private String status;
        private BigDecimal totalAmount;
        private BigDecimal finalAmount;
    }

    /**
     * Daily revenue for chart
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyRevenueDTO {
        private String date;
        private BigDecimal netRevenue;
        private Long orderCount;
    }
}
