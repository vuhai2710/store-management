package com.storemanagement.service;

import com.storemanagement.dto.report.RevenueByProductDTO;
import com.storemanagement.dto.report.RevenueByTimeDTO;
import com.storemanagement.dto.report.RevenueSummaryDTO;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    RevenueSummaryDTO getRevenueSummary(LocalDate fromDate, LocalDate toDate);

    List<RevenueByTimeDTO> getRevenueByTime(LocalDate fromDate, LocalDate toDate, String groupBy);

    List<RevenueByProductDTO> getRevenueByProduct(LocalDate fromDate, LocalDate toDate, Integer limit);
}
