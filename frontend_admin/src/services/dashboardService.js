import api from './api';

export const dashboardService = {

    getOverview: async (topProducts = 5, recentOrders = 10, chartDays = 7) => {
        const response = await api.get('/admin/dashboard/overview', {
            params: { topProducts, recentOrders, chartDays }
        });
        return response.data;
    },
};

export default dashboardService;
