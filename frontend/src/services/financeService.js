import api from './api';

export const financeService = {
  getFinancialData: async (params = {}) => {
    const response = await api.get('/finance', { params });
    return response.data;
  },

  getPayroll: async (params = {}) => {
    const response = await api.get('/finance/payroll', { params });
    return response.data;
  },

  createTransaction: async (transactionData) => {
    const response = await api.post('/finance/transactions', transactionData);
    return response.data;
  },

  updatePayroll: async (id, payrollData) => {
    const response = await api.put(`/finance/payroll/${id}`, payrollData);
    return response.data;
  },

  getRevenueReport: async (params = {}) => {
    const response = await api.get('/finance/reports/revenue', { params });
    return response.data;
  },

  getExpenseReport: async (params = {}) => {
    const response = await api.get('/finance/reports/expenses', { params });
    return response.data;
  },

  getProfitReport: async (params = {}) => {
    const response = await api.get('/finance/reports/profit', { params });
    return response.data;
  },

  exportFinancialReport: async (params = {}) => {
    const response = await api.get('/finance/reports/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};


