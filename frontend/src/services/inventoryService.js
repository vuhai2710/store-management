import api from './api';

export const inventoryService = {
  getInventory: async (params = {}) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  getSuppliers: async (params = {}) => {
    const response = await api.get('/suppliers', { params });
    return response.data;
  },

  getSupplierById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  updateSupplier: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },

  getWarehouses: async () => {
    const response = await api.get('/warehouses');
    return response.data;
  },

  createWarehouse: async (warehouseData) => {
    const response = await api.post('/warehouses', warehouseData);
    return response.data;
  },

  updateWarehouse: async (id, warehouseData) => {
    const response = await api.put(`/warehouses/${id}`, warehouseData);
    return response.data;
  },

  deleteWarehouse: async (id) => {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  },

  getStockMovements: async (params = {}) => {
    const response = await api.get('/inventory/movements', { params });
    return response.data;
  },

  createStockMovement: async (movementData) => {
    const response = await api.post('/inventory/movements', movementData);
    return response.data;
  },
};


