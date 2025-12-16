package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.report.RevenueByProductDTO;
import com.storemanagement.dto.report.RevenueByTimeDTO;
import com.storemanagement.dto.report.RevenueSummaryDTO;
import com.storemanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Admin Financial & Revenue Report Controller
 * 
 * All endpoints require ADMIN or EMPLOYEE role.
 * 
 * BUSINESS RULES:
 * - Shipping fee is NEVER included in revenue calculations
 * - Revenue is based on COMPLETED orders only
 * - Net Revenue = Product Revenue - Discount
 * - Gross Profit = Net Revenue - Import Cost
 */
@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
@Slf4j
public class AdminReportController {

        private final ReportService reportService;

        /**
         * Get revenue summary for a date range.
         * 
         * @param fromDate Start date (inclusive)
         * @param toDate   End date (inclusive)
         * @return Revenue summary with all financial metrics
         */
        @GetMapping("/revenue-summary")
        public ResponseEntity<ApiResponse<RevenueSummaryDTO>> getRevenueSummary(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                log.info("GET /admin/reports/revenue-summary from={} to={}", fromDate, toDate);

                // Validate date range
                if (fromDate.isAfter(toDate)) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(400, "Ngày bắt đầu phải trước ngày kết thúc"));
                }

                RevenueSummaryDTO summary = reportService.getRevenueSummary(fromDate, toDate);

                return ResponseEntity.ok(ApiResponse.success(
                                "Lấy báo cáo doanh thu thành công", summary));
        }

        /**
         * Get revenue breakdown by time period.
         * 
         * @param fromDate Start date (inclusive)
         * @param toDate   End date (inclusive)
         * @param groupBy  Grouping: DAY, MONTH (default), or YEAR
         * @return List of revenue data points for charting
         */
        @GetMapping("/revenue-by-time")
        public ResponseEntity<ApiResponse<List<RevenueByTimeDTO>>> getRevenueByTime(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                        @RequestParam(defaultValue = "MONTH") String groupBy) {

                log.info("GET /admin/reports/revenue-by-time from={} to={} groupBy={}",
                                fromDate, toDate, groupBy);

                // Validate date range
                if (fromDate.isAfter(toDate)) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(400, "Ngày bắt đầu phải trước ngày kết thúc"));
                }

                // Validate groupBy
                String normalizedGroupBy = groupBy.toUpperCase();
                if (!normalizedGroupBy.equals("DAY") && !normalizedGroupBy.equals("MONTH")
                                && !normalizedGroupBy.equals("YEAR")) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(400,
                                                        "Tham số groupBy không hợp lệ. Chấp nhận: DAY, MONTH, YEAR"));
                }

                List<RevenueByTimeDTO> data = reportService.getRevenueByTime(fromDate, toDate, normalizedGroupBy);

                return ResponseEntity.ok(ApiResponse.success(
                                "Lấy dữ liệu biểu đồ doanh thu thành công", data));
        }

        /**
         * Get revenue breakdown by product.
         * 
         * @param fromDate Start date (inclusive)
         * @param toDate   End date (inclusive)
         * @param limit    Maximum number of products to return (default: 20)
         * @return List of products sorted by net revenue descending
         */
        @GetMapping("/revenue-by-product")
        public ResponseEntity<ApiResponse<List<RevenueByProductDTO>>> getRevenueByProduct(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                        @RequestParam(defaultValue = "20") Integer limit) {

                log.info("GET /admin/reports/revenue-by-product from={} to={} limit={}",
                                fromDate, toDate, limit);

                // Validate date range
                if (fromDate.isAfter(toDate)) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(400, "Ngày bắt đầu phải trước ngày kết thúc"));
                }

                List<RevenueByProductDTO> data = reportService.getRevenueByProduct(fromDate, toDate, limit);

                return ResponseEntity.ok(ApiResponse.success(
                                "Lấy dữ liệu doanh thu theo sản phẩm thành công", data));
        }
}
