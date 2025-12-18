package com.storemanagement.dto.dashboard;

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
public class DashboardOverviewDTO {

    private BigDecimal todayRevenue;

    private Long ordersToday;

    private Long completedOrdersToday;

    private BigDecimal monthRevenue;

    private Long ordersThisMonth;

    private Long completedOrdersThisMonth;

    private Long activeReturnRequests;

    private List<TopProductDTO> topProducts;

    private List<RecentOrderDTO> recentOrders;

    private List<DailyRevenueDTO> revenueChart;

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
