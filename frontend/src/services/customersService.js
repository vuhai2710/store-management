import api from './api';

export const customersService = {
  getCustomers: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  getCustomerOrders: async (id, params = {}) => {
    const response = await api.get(`/customers/${id}/orders`, { params });
    return response.data;
  },

  getCustomerStats: async (id) => {
    const response = await api.get(`/customers/${id}/stats`);
    return response.data;
  },
};


