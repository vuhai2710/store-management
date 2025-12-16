package com.storemanagement.service.impl;

import com.storemanagement.dto.dashboard.DashboardOverviewDTO;
import com.storemanagement.dto.dashboard.DashboardOverviewDTO.*;
import com.storemanagement.model.Order;
import com.storemanagement.model.OrderReturn;
import com.storemanagement.service.DashboardService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Dashboard service implementation.
 * Provides optimized queries for dashboard KPIs.
 * 
 * IMPORTANT: Revenue = Products only (EXCLUDES shipping fee)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    public DashboardOverviewDTO getDashboardOverview(int topProductsLimit, int recentOrdersLimit, int chartDays) {
        log.info("Generating dashboard overview: topProducts={}, recentOrders={}, chartDays={}",
                topProductsLimit, recentOrdersLimit, chartDays);

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(23, 59, 59);

        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();

        // === 1. Today's Revenue (Net = Products - Discount, EXCLUDES shipping) ===
        BigDecimal todayRevenue = getNetRevenue(startOfToday, endOfToday);

        // === 2. Today's Orders ===
        Long ordersToday = getOrderCount(startOfToday, endOfToday, null);
        Long completedOrdersToday = getOrderCount(startOfToday, endOfToday, Order.OrderStatus.COMPLETED);

        // === 3. Month Revenue ===
        BigDecimal monthRevenue = getNetRevenue(startOfMonth, endOfToday);

        // === 4. Month Orders ===
        Long ordersThisMonth = getOrderCount(startOfMonth, endOfToday, null);
        Long completedOrdersThisMonth = getOrderCount(startOfMonth, endOfToday, Order.OrderStatus.COMPLETED);

        // === 5. Active Return Requests ===
        Long activeReturnRequests = getActiveReturnRequests();

        // === 6. Top Products (by quantity sold this month) ===
        List<TopProductDTO> topProducts = getTopProducts(startOfMonth, endOfToday, topProductsLimit);

        // === 7. Recent Orders ===
        List<RecentOrderDTO> recentOrders = getRecentOrders(recentOrdersLimit);

        // === 8. Revenue Chart (last N days) ===
        List<DailyRevenueDTO> revenueChart = getDailyRevenue(chartDays);

        return DashboardOverviewDTO.builder()
                .todayRevenue(todayRevenue.setScale(2, RoundingMode.HALF_UP))
                .ordersToday(ordersToday)
                .completedOrdersToday(completedOrdersToday)
                .monthRevenue(monthRevenue.setScale(2, RoundingMode.HALF_UP))
                .ordersThisMonth(ordersThisMonth)
                .completedOrdersThisMonth(completedOrdersThisMonth)
                .activeReturnRequests(activeReturnRequests)
                .topProducts(topProducts)
                .recentOrders(recentOrders)
                .revenueChart(revenueChart)
                .build();
    }

    /**
     * Get net revenue for a period.
     * Net Revenue = SUM(quantity * price) - SUM(discount) for COMPLETED orders.
     * EXCLUDES shipping fee.
     * 
     * Note: Uses separate queries to avoid counting discount multiple times
     * when orders have multiple order details.
     */
    private BigDecimal getNetRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        // Get product revenue (SUM of quantity * price)
        String productRevenueQuery = """
                SELECT COALESCE(SUM(od.quantity * od.price), 0)
                FROM Order o
                JOIN o.orderDetails od
                WHERE o.status = :completedStatus
                  AND o.orderDate BETWEEN :startDate AND :endDate
                """;

        Query prodQuery = entityManager.createQuery(productRevenueQuery);
        prodQuery.setParameter("completedStatus", Order.OrderStatus.COMPLETED);
        prodQuery.setParameter("startDate", startDate);
        prodQuery.setParameter("endDate", endDate);

        BigDecimal productRevenue = (BigDecimal) prodQuery.getSingleResult();
        if (productRevenue == null) {
            productRevenue = BigDecimal.ZERO;
        }

        // Get total discount (SUM of order.discount - NOT from order_details to avoid
        // multiplication)
        String discountQuery = """
                SELECT COALESCE(SUM(o.discount), 0)
                FROM Order o
                WHERE o.status = :completedStatus
                  AND o.orderDate BETWEEN :startDate AND :endDate
                """;

        Query discQuery = entityManager.createQuery(discountQuery);
        discQuery.setParameter("completedStatus", Order.OrderStatus.COMPLETED);
        discQuery.setParameter("startDate", startDate);
        discQuery.setParameter("endDate", endDate);

        BigDecimal totalDiscount = (BigDecimal) discQuery.getSingleResult();
        if (totalDiscount == null) {
            totalDiscount = BigDecimal.ZERO;
        }

        // Net Revenue = Product Revenue - Discount (minimum 0)
        BigDecimal netRevenue = productRevenue.subtract(totalDiscount);
        if (netRevenue.compareTo(BigDecimal.ZERO) < 0) {
            netRevenue = BigDecimal.ZERO;
        }

        return netRevenue;
    }

    /**
     * Get order count for a period.
     */
    private Long getOrderCount(LocalDateTime startDate, LocalDateTime endDate, Order.OrderStatus status) {
        String query;
        if (status != null) {
            query = """
                    SELECT COUNT(o)
                    FROM Order o
                    WHERE o.status = :status
                      AND o.orderDate BETWEEN :startDate AND :endDate
                    """;
        } else {
            query = """
                    SELECT COUNT(o)
                    FROM Order o
                    WHERE o.orderDate BETWEEN :startDate AND :endDate
                    """;
        }

        Query queryObj = entityManager.createQuery(query);
        if (status != null) {
            queryObj.setParameter("status", status);
        }
        queryObj.setParameter("startDate", startDate);
        queryObj.setParameter("endDate", endDate);

        return (Long) queryObj.getSingleResult();
    }

    /**
     * Get count of active return requests (REQUESTED status).
     */
    private Long getActiveReturnRequests() {
        String query = """
                SELECT COUNT(r)
                FROM OrderReturn r
                WHERE r.status = :requestedStatus
                """;

        Query queryObj = entityManager.createQuery(query);
        queryObj.setParameter("requestedStatus", OrderReturn.ReturnStatus.REQUESTED);

        return (Long) queryObj.getSingleResult();
    }

    /**
     * Get top selling products.
     */
    private List<TopProductDTO> getTopProducts(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        String query = """
                SELECT p.idProduct, p.productCode, p.productName, p.imageUrl,
                       SUM(od.quantity) as quantitySold,
                       SUM(od.quantity * od.price) as revenue
                FROM Order o
                JOIN o.orderDetails od
                JOIN od.product p
                WHERE o.status = :completedStatus
                  AND o.orderDate BETWEEN :startDate AND :endDate
                GROUP BY p.idProduct, p.productCode, p.productName, p.imageUrl
                ORDER BY SUM(od.quantity) DESC
                """;

        Query queryObj = entityManager.createQuery(query);
        queryObj.setParameter("completedStatus", Order.OrderStatus.COMPLETED);
        queryObj.setParameter("startDate", startDate);
        queryObj.setParameter("endDate", endDate);
        queryObj.setMaxResults(limit);

        @SuppressWarnings("unchecked")
        List<Object[]> results = queryObj.getResultList();

        List<TopProductDTO> topProducts = new ArrayList<>();
        for (Object[] row : results) {
            topProducts.add(TopProductDTO.builder()
                    .productId((Integer) row[0])
                    .productCode((String) row[1])
                    .productName((String) row[2])
                    .imageUrl((String) row[3])
                    .quantitySold((Long) row[4])
                    .netRevenue(((BigDecimal) row[5]).setScale(2, RoundingMode.HALF_UP))
                    .build());
        }

        return topProducts;
    }

    /**
     * Get recent orders.
     */
    private List<RecentOrderDTO> getRecentOrders(int limit) {
        String query = """
                SELECT o.idOrder, c.customerName, o.orderDate, o.status, o.totalAmount, o.finalAmount
                FROM Order o
                LEFT JOIN o.customer c
                ORDER BY o.orderDate DESC
                """;

        Query queryObj = entityManager.createQuery(query);
        queryObj.setMaxResults(limit);

        @SuppressWarnings("unchecked")
        List<Object[]> results = queryObj.getResultList();

        List<RecentOrderDTO> recentOrders = new ArrayList<>();
        for (Object[] row : results) {
            LocalDateTime orderDate = (LocalDateTime) row[2];
            Order.OrderStatus status = (Order.OrderStatus) row[3];

            recentOrders.add(RecentOrderDTO.builder()
                    .orderId((Integer) row[0])
                    .customerName((String) row[1])
                    .orderDate(orderDate != null ? orderDate.format(DATE_FORMATTER) : null)
                    .status(status != null ? status.name() : null)
                    .totalAmount((BigDecimal) row[4])
                    .finalAmount((BigDecimal) row[5])
                    .build());
        }

        return recentOrders;
    }

    /**
     * Get daily revenue for last N days.
     * Uses separate subqueries to avoid counting discount multiple times.
     */
    private List<DailyRevenueDTO> getDailyRevenue(int days) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);

        // Get product revenue per day
        String productRevenueQuery = """
                SELECT DATE(o.order_date) as order_day,
                       COALESCE(SUM(od.quantity * od.price), 0) as product_revenue
                FROM orders o
                JOIN order_details od ON o.id_order = od.id_order
                WHERE o.status = 'COMPLETED'
                  AND DATE(o.order_date) >= :startDate
                GROUP BY DATE(o.order_date)
                ORDER BY order_day ASC
                """;

        Query prodQuery = entityManager.createNativeQuery(productRevenueQuery);
        prodQuery.setParameter("startDate", startDate);

        @SuppressWarnings("unchecked")
        List<Object[]> prodResults = prodQuery.getResultList();

        // Get discount and order count per day (from orders table only)
        String discountQuery = """
                SELECT DATE(o.order_date) as order_day,
                       COALESCE(SUM(o.discount), 0) as total_discount,
                       COUNT(o.id_order) as order_count
                FROM orders o
                WHERE o.status = 'COMPLETED'
                  AND DATE(o.order_date) >= :startDate
                GROUP BY DATE(o.order_date)
                ORDER BY order_day ASC
                """;

        Query discQuery = entityManager.createNativeQuery(discountQuery);
        discQuery.setParameter("startDate", startDate);

        @SuppressWarnings("unchecked")
        List<Object[]> discResults = discQuery.getResultList();

        // Create a map for discount data
        java.util.Map<LocalDate, Object[]> discountMap = new java.util.HashMap<>();
        for (Object[] row : discResults) {
            java.sql.Date sqlDate = (java.sql.Date) row[0];
            LocalDate date = sqlDate.toLocalDate();
            discountMap.put(date, row);
        }

        List<DailyRevenueDTO> dailyRevenue = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");

        for (Object[] row : prodResults) {
            java.sql.Date sqlDate = (java.sql.Date) row[0];
            LocalDate date = sqlDate.toLocalDate();
            BigDecimal productRevenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;

            // Get discount for this day
            BigDecimal discount = BigDecimal.ZERO;
            Long orderCount = 0L;
            if (discountMap.containsKey(date)) {
                Object[] discRow = discountMap.get(date);
                discount = discRow[1] != null ? new BigDecimal(discRow[1].toString()) : BigDecimal.ZERO;
                orderCount = discRow[2] != null ? ((Number) discRow[2]).longValue() : 0L;
            }

            // Calculate net revenue (minimum 0)
            BigDecimal netRevenue = productRevenue.subtract(discount);
            if (netRevenue.compareTo(BigDecimal.ZERO) < 0) {
                netRevenue = BigDecimal.ZERO;
            }

            dailyRevenue.add(DailyRevenueDTO.builder()
                    .date(date.format(formatter))
                    .netRevenue(netRevenue.setScale(2, RoundingMode.HALF_UP))
                    .orderCount(orderCount)
                    .build());
        }

        return dailyRevenue;
    }
}
