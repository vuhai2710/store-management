import api from './api';

/**
 * Dashboard Service
 * Provides dashboard overview data in a single API call.
 * 
 * IMPORTANT: Revenue = Products only (EXCLUDES shipping fee)
 */
export const dashboardService = {
    /**
     * Get dashboard overview with all KPIs
     * @param {number} topProducts - Number of top products (default: 5)
     * @param {number} recentOrders - Number of recent orders (default: 10)
     * @param {number} chartDays - Number of days for chart (default: 7)
     * @returns {Promise} Dashboard overview data
     */
    getOverview: async (topProducts = 5, recentOrders = 10, chartDays = 7) => {
        const response = await api.get('/admin/dashboard/overview', {
            params: { topProducts, recentOrders, chartDays }
        });
        return response.data;
    },
};

export default dashboardService;
