package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.dashboard.DashboardOverviewDTO;
import com.storemanagement.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin Dashboard Controller
 * 
 * Provides dashboard overview with all KPIs in a single API call.
 * 
 * IMPORTANT: Revenue = Products only (EXCLUDES shipping fee)
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
@Slf4j
public class AdminDashboardController {

    private final DashboardService dashboardService;

    /**
     * Get dashboard overview with all KPIs.
     * 
     * @param topProducts  Number of top products to return (default: 5)
     * @param recentOrders Number of recent orders to return (default: 10)
     * @param chartDays    Number of days for revenue chart (default: 7)
     * @return Dashboard overview data in one response
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DashboardOverviewDTO>> getDashboardOverview(
            @RequestParam(defaultValue = "5") int topProducts,
            @RequestParam(defaultValue = "10") int recentOrders,
            @RequestParam(defaultValue = "7") int chartDays) {

        log.info("GET /admin/dashboard/overview topProducts={}, recentOrders={}, chartDays={}",
                topProducts, recentOrders, chartDays);

        // Validate limits
        topProducts = Math.max(1, Math.min(topProducts, 20));
        recentOrders = Math.max(1, Math.min(recentOrders, 50));
        chartDays = Math.max(1, Math.min(chartDays, 90));

        DashboardOverviewDTO overview = dashboardService.getDashboardOverview(
                topProducts, recentOrders, chartDays);

        return ResponseEntity.ok(ApiResponse.success(
                "Lấy dữ liệu dashboard thành công", overview));
    }
}
