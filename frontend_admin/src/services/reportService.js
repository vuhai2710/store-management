import api from './api';

/**
 * Report Service for Financial & Revenue Reports
 * 
 * BUSINESS RULES:
 * - Shipping fee is NEVER included in revenue calculations
 * - Revenue is based on COMPLETED orders only
 * - Net Revenue = Product Revenue - Discount
 * - Gross Profit = Net Revenue - Import Cost
 */
export const reportService = {
    /**
     * Get revenue summary for a date range
     * @param {string} fromDate - Start date (YYYY-MM-DD)
     * @param {string} toDate - End date (YYYY-MM-DD)
     * @returns {Promise} Revenue summary
     */
    getRevenueSummary: async (fromDate, toDate) => {
        const response = await api.get('/admin/reports/revenue-summary', {
            params: { fromDate, toDate }
        });
        return response.data;
    },

    /**
     * Get revenue breakdown by time period
     * @param {string} fromDate - Start date (YYYY-MM-DD)
     * @param {string} toDate - End date (YYYY-MM-DD)
     * @param {string} groupBy - DAY, MONTH, or YEAR
     * @returns {Promise} Array of revenue data points
     */
    getRevenueByTime: async (fromDate, toDate, groupBy = 'MONTH') => {
        const response = await api.get('/admin/reports/revenue-by-time', {
            params: { fromDate, toDate, groupBy }
        });
        return response.data;
    },

    /**
     * Get revenue breakdown by product
     * @param {string} fromDate - Start date (YYYY-MM-DD)
     * @param {string} toDate - End date (YYYY-MM-DD)
     * @param {number} limit - Maximum products to return
     * @returns {Promise} Array of product revenue data
     */
    getRevenueByProduct: async (fromDate, toDate, limit = 20) => {
        const response = await api.get('/admin/reports/revenue-by-product', {
            params: { fromDate, toDate, limit }
        });
        return response.data;
    },
};

export default reportService;
