package com.storemanagement.service;

import com.storemanagement.dto.dashboard.DashboardOverviewDTO;

/**
 * Service for dashboard data aggregation.
 */
public interface DashboardService {

    /**
     * Get dashboard overview with all KPIs.
     * 
     * @param topProductsLimit  Number of top products to return
     * @param recentOrdersLimit Number of recent orders to return
     * @param chartDays         Number of days for revenue chart
     * @return Dashboard overview data
     */
    DashboardOverviewDTO getDashboardOverview(int topProductsLimit, int recentOrdersLimit, int chartDays);
}
