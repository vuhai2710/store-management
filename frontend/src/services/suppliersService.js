import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const suppliersService = {
  // Lấy tất cả (không phân trang)
  getAllSuppliers: async () => {
    console.log('Calling getAllSuppliers');
    const response = await api.get(API_ENDPOINTS.SUPPLIERS.GET_ALL);
    console.log('API Response getAllSuppliers:', response.data);
    return response.data;
  },

  // Phân trang (nếu cần dùng sau)
  getSuppliersPaginated: async ({ pageNo = 1, pageSize = 10, sortBy = 'idSupplier', sortDirection = 'ASC', name } = {}) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    if (name) params.name = name;
    console.log('Calling getSuppliersPaginated with params:', params);
    const response = await api.get(API_ENDPOINTS.SUPPLIERS.BASE, { params });
    console.log('API Response getSuppliersPaginated:', response.data);
    return response.data; // PageResponse
  },

  getSupplierById: async (id) => {
    console.log('Calling getSupplierById:', id);
    const response = await api.get(API_ENDPOINTS.SUPPLIERS.BY_ID(id));
    console.log('API Response getSupplierById:', response.data);
    return response.data;
  },

  createSupplier: async (supplierData) => {
    // Chuẩn hóa theo SupplierDto BE
    const body = {
      supplierName: supplierData.supplierName,
      email: supplierData.email,
      phoneNumber: supplierData.phoneNumber,
      address: supplierData.address,
    };
    console.log('Calling createSupplier with:', body);
    const response = await api.post(API_ENDPOINTS.SUPPLIERS.CREATE, body);
    console.log('API Response createSupplier:', response.data);
    return response.data;
  },

  updateSupplier: async (id, supplierData) => {
    const body = {
      supplierName: supplierData.supplierName,
      email: supplierData.email,
      phoneNumber: supplierData.phoneNumber,
      address: supplierData.address,
    };
    console.log('Calling updateSupplier id:', id, 'body:', body);
    const response = await api.put(API_ENDPOINTS.SUPPLIERS.UPDATE(id), body);
    console.log('API Response updateSupplier:', response.data);
    return response.data;
  },

  deleteSupplier: async (id) => {
    console.log('Calling deleteSupplier id:', id);
    const response = await api.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id));
    console.log('API Response deleteSupplier:', response.data);
    return response.data;
  },

  // Tìm kiếm theo tên — BE dùng param 'name'
  searchSuppliers: async (name) => {
    console.log('Calling searchSuppliers name:', name);
    const response = await api.get(API_ENDPOINTS.SUPPLIERS.SEARCH, { params: { name } });
    console.log('API Response searchSuppliers:', response.data);
    return response.data;
  },
};
