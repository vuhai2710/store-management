package com.storemanagement.service;

import com.storemanagement.dto.dashboard.DashboardOverviewDTO;

public interface DashboardService {

    DashboardOverviewDTO getDashboardOverview(int topProductsLimit, int recentOrdersLimit, int chartDays);
}
