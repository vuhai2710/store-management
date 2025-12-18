package com.storemanagement.service.impl;

import com.storemanagement.dto.report.RevenueByProductDTO;
import com.storemanagement.dto.report.RevenueByTimeDTO;
import com.storemanagement.dto.report.RevenueSummaryDTO;
import com.storemanagement.model.Order;
import com.storemanagement.service.ReportService;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReportServiceImpl implements ReportService {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public RevenueSummaryDTO getRevenueSummary(LocalDate fromDate, LocalDate toDate) {
        log.info("Generating revenue summary from {} to {}", fromDate, toDate);

        LocalDateTime startDateTime = fromDate.atStartOfDay();
        LocalDateTime endDateTime = toDate.atTime(23, 59, 59);

        String productRevenueQuery = """
                SELECT COALESCE(SUM(od.quantity * od.price), 0) as productRevenue
                FROM Order o
                JOIN o.orderDetails od
                WHERE o.status = :completedStatus
                  AND o.orderDate BETWEEN :startDate AND :endDate
                """;

        Query prodQuery = entityManager.createQuery(productRevenueQuery);
        prodQuery.setParameter("completedStatus", Order.OrderStatus.COMPLETED);
        prodQuery.setParameter("startDate", startDateTime);
        prodQuery.setParameter("endDate", endDateTime);

        BigDecimal productRevenue = (BigDecimal) prodQuery.getSingleResult();
        if (productRevenue == null) {
            productRevenue = BigDecimal.ZERO;
        }

        String orderStatsQuery = """
                SELECT COALESCE(SUM(o.discount), 0) as totalDiscount,
                       COALESCE(SUM(o.shippingFee), 0) as shippingFeeTotal,
                       COUNT(o.idOrder) as completedOrders
                FROM Order o
                WHERE o.status = :completedStatus
                  AND o.orderDate BETWEEN :startDate AND :endDate
                """;

        Query statsQuery = entityManager.createQuery(orderStatsQuery);
        statsQuery.setParameter("completedStatus", Order.OrderStatus.COMPLETED);
        statsQuery.setParameter("startDate", startDateTime);
        statsQuery.setParameter("endDate", endDateTime);

        Object[] stats = (Object[]) statsQuery.getSingleResult();
        BigDecimal totalDiscount = stats[0] != null ? (BigDecimal) stats[0] : BigDecimal.ZERO;
        BigDecimal shippingFeeTotal = stats[1] != null ? (BigDecimal) stats[1] : BigDecimal.ZERO;
        Long completedOrders = stats[2] != null ? (Long) stats[2] : 0L;

        BigDecimal netRevenue = productRevenue.subtract(totalDiscount);
        if (netRevenue.compareTo(BigDecimal.ZERO) < 0) {
            netRevenue = BigDecimal.ZERO;
        }

        BigDecimal importCost = calculateImportCost(startDateTime, endDateTime);

        BigDecimal grossProfit = netRevenue.subtract(importCost);

        String countQuery = """
                SELECT o.status, COUNT(o)
                FROM Order o
                WHERE o.orderDate BETWEEN :startDate AND :endDate
                GROUP BY o.status
                """;

        Query countQueryObj = entityManager.createQuery(countQuery);
        countQueryObj.setParameter("startDate", startDateTime);
        countQueryObj.setParameter("endDate", endDateTime);

        @SuppressWarnings("unchecked")
        List<Object[]> statusCounts = countQueryObj.getResultList();

        long totalOrders = 0;
        long countedCompletedOrders = 0;
        long canceledOrders = 0;
        long pendingOrders = 0;
        long confirmedOrders = 0;

        for (Object[] row : statusCounts) {
            Order.OrderStatus status = (Order.OrderStatus) row[0];
            Long count = (Long) row[1];
            totalOrders += count;

            switch (status) {
                case COMPLETED -> countedCompletedOrders = count;
                case CANCELED -> canceledOrders = count;
                case PENDING -> pendingOrders = count;
                case CONFIRMED -> confirmedOrders = count;
            }
        }

        final long finalCompletedOrders = countedCompletedOrders > 0 ? countedCompletedOrders : completedOrders;

        String returnQuery = """
                SELECT COUNT(r), COALESCE(SUM(r.refundAmount), 0)
                FROM OrderReturn r
                WHERE r.status = :approvedStatus
                  AND r.createdAt BETWEEN :startDate AND :endDate
                """;

        Query returnQueryObj = entityManager.createQuery(returnQuery);
        returnQueryObj.setParameter("approvedStatus", com.storemanagement.model.OrderReturn.ReturnStatus.APPROVED);
        returnQueryObj.setParameter("startDate", startDateTime);
        returnQueryObj.setParameter("endDate", endDateTime);

        Object[] returnResult = (Object[]) returnQueryObj.getSingleResult();
        Long returnedOrders = (Long) returnResult[0];
        BigDecimal refundAmount = (BigDecimal) returnResult[1];

        return RevenueSummaryDTO.builder()
                .productRevenue(productRevenue.setScale(2, RoundingMode.HALF_UP))
                .totalDiscount(totalDiscount.setScale(2, RoundingMode.HALF_UP))
                .netRevenue(netRevenue.setScale(2, RoundingMode.HALF_UP))
                .importCost(importCost.setScale(2, RoundingMode.HALF_UP))
                .grossProfit(grossProfit.setScale(2, RoundingMode.HALF_UP))
                .totalOrders(totalOrders)
                .completedOrders(finalCompletedOrders)
                .canceledOrders(canceledOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .returnedOrders(returnedOrders)
                .refundAmount(refundAmount != null ? refundAmount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .shippingFeeTotal(shippingFeeTotal.setScale(2, RoundingMode.HALF_UP))
                .fromDate(fromDate.toString())
                .toDate(toDate.toString())
                .build();
    }

    private BigDecimal calculateImportCost(LocalDateTime startDate, LocalDateTime endDate) {

        String soldProductsQuery = """
                SELECT od.product.idProduct as productId,
                       SUM(od.quantity) as quantitySold
                FROM Order o
                JOIN o.orderDetails od
                WHERE o.status = :completedStatus
                  AND o.orderDate BETWEEN :startDate AND :endDate
                GROUP BY od.product.idProduct
                """;

        Query query = entityManager.createQuery(soldProductsQuery);
        query.setParameter("completedStatus", Order.OrderStatus.COMPLETED);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);

        @SuppressWarnings("unchecked")
        List<Object[]> soldProducts = query.getResultList();

        if (soldProducts.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalImportCost = BigDecimal.ZERO;

        for (Object[] row : soldProducts) {
            Integer productId = (Integer) row[0];
            Long quantitySold = (Long) row[1];

            BigDecimal avgImportPrice = getAverageImportPrice(productId);

            if (avgImportPrice != null && avgImportPrice.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal productCost = avgImportPrice.multiply(BigDecimal.valueOf(quantitySold));
                totalImportCost = totalImportCost.add(productCost);
            }
        }

        return totalImportCost;
    }

    private BigDecimal getAverageImportPrice(Integer productId) {
        String avgPriceQuery = """
                SELECT AVG(pod.importPrice)
                FROM ImportOrderDetail pod
                WHERE pod.product.idProduct = :productId
                """;

        Query query = entityManager.createQuery(avgPriceQuery);
        query.setParameter("productId", productId);

        try {
            Double avgPrice = (Double) query.getSingleResult();
            return avgPrice != null ? BigDecimal.valueOf(avgPrice) : BigDecimal.ZERO;
        } catch (Exception e) {
            log.warn("Could not get average import price for product {}: {}", productId, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    @Override
    public List<RevenueByTimeDTO> getRevenueByTime(LocalDate fromDate, LocalDate toDate, String groupBy) {
        log.info("Generating revenue by time from {} to {}, groupBy={}", fromDate, toDate, groupBy);

        LocalDateTime startDateTime = fromDate.atStartOfDay();
        LocalDateTime endDateTime = toDate.atTime(23, 59, 59);

        String dateFormat = switch (groupBy.toUpperCase()) {
            case "DAY" -> "%Y-%m-%d";
            case "YEAR" -> "%Y";
            default -> "%Y-%m";
        };

        String nativeQuery = """
                SELECT DATE_FORMAT(o.order_date, :dateFormat) as time_period,
                       COALESCE(SUM(od.quantity * od.price), 0) as product_revenue,
                       COALESCE(SUM(o.discount), 0) as total_discount,
                       COUNT(DISTINCT o.id_order) as order_count
                FROM orders o
                JOIN order_details od ON o.id_order = od.id_order
                WHERE o.status = 'COMPLETED'
                  AND o.order_date BETWEEN :startDate AND :endDate
                GROUP BY DATE_FORMAT(o.order_date, :dateFormat)
                ORDER BY time_period ASC
                """;

        Query query = entityManager.createNativeQuery(nativeQuery);
        query.setParameter("dateFormat", dateFormat);
        query.setParameter("startDate", startDateTime);
        query.setParameter("endDate", endDateTime);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        List<RevenueByTimeDTO> response = new ArrayList<>();

        for (Object[] row : results) {
            String timePeriod = (String) row[0];
            BigDecimal productRevenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            BigDecimal totalDiscount = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
            Long orderCount = row[3] != null ? ((Number) row[3]).longValue() : 0L;

            BigDecimal netRevenue = productRevenue.subtract(totalDiscount);
            if (netRevenue.compareTo(BigDecimal.ZERO) < 0) {
                netRevenue = BigDecimal.ZERO;
            }

            response.add(RevenueByTimeDTO.builder()
                    .time(timePeriod)
                    .productRevenue(productRevenue.setScale(2, RoundingMode.HALF_UP))
                    .totalDiscount(totalDiscount.setScale(2, RoundingMode.HALF_UP))
                    .netRevenue(netRevenue.setScale(2, RoundingMode.HALF_UP))
                    .orderCount(orderCount)
                    .build());
        }

        return response;
    }

    @Override
    public List<RevenueByProductDTO> getRevenueByProduct(LocalDate fromDate, LocalDate toDate, Integer limit) {
        log.info("Generating revenue by product from {} to {}, limit={}", fromDate, toDate, limit);

        LocalDateTime startDateTime = fromDate.atStartOfDay();
        LocalDateTime endDateTime = toDate.atTime(23, 59, 59);

        String jpqlQuery = """
                SELECT p.idProduct as productId,
                       p.productCode as productCode,
                       p.productName as productName,
                       c.categoryName as categoryName,
                       SUM(od.quantity) as quantitySold,
                       SUM(od.quantity * od.price) as productRevenue
                FROM Order o
                JOIN o.orderDetails od
                JOIN od.product p
                LEFT JOIN p.category c
                WHERE o.status = :completedStatus
                  AND o.orderDate BETWEEN :startDate AND :endDate
                GROUP BY p.idProduct, p.productCode, p.productName, c.categoryName
                ORDER BY SUM(od.quantity * od.price) DESC
                """;

        Query query = entityManager.createQuery(jpqlQuery);
        query.setParameter("completedStatus", Order.OrderStatus.COMPLETED);
        query.setParameter("startDate", startDateTime);
        query.setParameter("endDate", endDateTime);

        if (limit != null && limit > 0) {
            query.setMaxResults(limit);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        BigDecimal totalProductRevenue = BigDecimal.ZERO;
        for (Object[] row : results) {
            BigDecimal revenue = (BigDecimal) row[5];
            totalProductRevenue = totalProductRevenue.add(revenue);
        }

        BigDecimal totalDiscount = getTotalDiscountForPeriod(startDateTime, endDateTime);

        List<RevenueByProductDTO> response = new ArrayList<>();

        for (Object[] row : results) {
            Integer productId = (Integer) row[0];
            String productCode = (String) row[1];
            String productName = (String) row[2];
            String categoryName = (String) row[3];
            Long quantitySold = (Long) row[4];
            BigDecimal productRevenue = (BigDecimal) row[5];

            BigDecimal discount = BigDecimal.ZERO;
            if (totalProductRevenue.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal revenueShare = productRevenue.divide(totalProductRevenue, 10, RoundingMode.HALF_UP);
                discount = totalDiscount.multiply(revenueShare);
            }

            BigDecimal netRevenue = productRevenue.subtract(discount);
            if (netRevenue.compareTo(BigDecimal.ZERO) < 0) {
                netRevenue = BigDecimal.ZERO;
            }

            BigDecimal avgSellingPrice = quantitySold > 0
                    ? productRevenue.divide(BigDecimal.valueOf(quantitySold), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            response.add(RevenueByProductDTO.builder()
                    .productId(productId)
                    .productCode(productCode)
                    .productName(productName)
                    .categoryName(categoryName)
                    .quantitySold(quantitySold)
                    .productRevenue(productRevenue.setScale(2, RoundingMode.HALF_UP))
                    .discount(discount.setScale(2, RoundingMode.HALF_UP))
                    .netRevenue(netRevenue.setScale(2, RoundingMode.HALF_UP))
                    .avgSellingPrice(avgSellingPrice)
                    .build());
        }

        return response;
    }

    private BigDecimal getTotalDiscountForPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        String query = """
                SELECT COALESCE(SUM(o.discount), 0)
                FROM Order o
                WHERE o.status = :completedStatus
                  AND o.orderDate BETWEEN :startDate AND :endDate
                """;

        Query queryObj = entityManager.createQuery(query);
        queryObj.setParameter("completedStatus", Order.OrderStatus.COMPLETED);
        queryObj.setParameter("startDate", startDate);
        queryObj.setParameter("endDate", endDate);

        return (BigDecimal) queryObj.getSingleResult();
    }
}
