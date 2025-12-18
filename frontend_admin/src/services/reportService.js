import api from './api';

export const reportService = {

    getRevenueSummary: async (fromDate, toDate) => {
        const response = await api.get('/admin/reports/revenue-summary', {
            params: { fromDate, toDate }
        });
        return response.data;
    },

    getRevenueByTime: async (fromDate, toDate, groupBy = 'MONTH') => {
        const response = await api.get('/admin/reports/revenue-by-time', {
            params: { fromDate, toDate, groupBy }
        });
        return response.data;
    },

    getRevenueByProduct: async (fromDate, toDate, limit = 20) => {
        const response = await api.get('/admin/reports/revenue-by-product', {
            params: { fromDate, toDate, limit }
        });
        return response.data;
    },
};

export default reportService;
