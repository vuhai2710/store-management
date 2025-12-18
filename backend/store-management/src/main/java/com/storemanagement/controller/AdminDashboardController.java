package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.dashboard.DashboardOverviewDTO;
import com.storemanagement.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
@Slf4j
public class AdminDashboardController {

        private final DashboardService dashboardService;

        @GetMapping("/overview")
        public ResponseEntity<ApiResponse<DashboardOverviewDTO>> getDashboardOverview(
                        @RequestParam(defaultValue = "5") int topProducts,
                        @RequestParam(defaultValue = "10") int recentOrders,
                        @RequestParam(defaultValue = "7") int chartDays) {

                log.info("GET /admin/dashboard/overview topProducts={}, recentOrders={}, chartDays={}",
                                topProducts, recentOrders, chartDays);

                topProducts = Math.max(1, Math.min(topProducts, 20));
                recentOrders = Math.max(1, Math.min(recentOrders, 50));
                chartDays = Math.max(1, Math.min(chartDays, 90));

                DashboardOverviewDTO overview = dashboardService.getDashboardOverview(
                                topProducts, recentOrders, chartDays);

                return ResponseEntity.ok(ApiResponse.success(
                                "Lấy dữ liệu dashboard thành công", overview));
        }
}
