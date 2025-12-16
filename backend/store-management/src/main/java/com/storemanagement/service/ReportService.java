package com.storemanagement.service;

import com.storemanagement.dto.report.RevenueByProductDTO;
import com.storemanagement.dto.report.RevenueByTimeDTO;
import com.storemanagement.dto.report.RevenueSummaryDTO;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for generating financial and revenue reports.
 * 
 * IMPORTANT: Shipping fee is NEVER included in revenue calculations.
 */
public interface ReportService {

    /**
     * Get revenue summary for a date range.
     * 
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return Revenue summary with all financial metrics
     */
    RevenueSummaryDTO getRevenueSummary(LocalDate fromDate, LocalDate toDate);

    /**
     * Get revenue breakdown by time period.
     * 
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @param groupBy  Grouping: DAY, MONTH, or YEAR
     * @return List of revenue data points for charting
     */
    List<RevenueByTimeDTO> getRevenueByTime(LocalDate fromDate, LocalDate toDate, String groupBy);

    /**
     * Get revenue breakdown by product.
     * 
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @param limit    Maximum number of products to return (null for all)
     * @return List of products sorted by net revenue descending
     */
    List<RevenueByProductDTO> getRevenueByProduct(LocalDate fromDate, LocalDate toDate, Integer limit);
}
