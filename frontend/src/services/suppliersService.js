import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const suppliersService = {
  // Lấy danh sách tất cả suppliers
  getAllSuppliers: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SUPPLIERS.GET_ALL);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin supplier theo ID
  getSupplierById: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.SUPPLIERS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo supplier mới
  createSupplier: async (supplierData) => {
    try {
      const response = await api.post(API_ENDPOINTS.SUPPLIERS.CREATE, supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin supplier
  updateSupplier: async (id, supplierData) => {
    try {
      const response = await api.put(API_ENDPOINTS.SUPPLIERS.UPDATE(id), supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa supplier
  deleteSupplier: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tìm kiếm suppliers
  searchSuppliers: async (keyword) => {
    try {
      const response = await api.get(API_ENDPOINTS.SUPPLIERS.SEARCH, {
        params: { keyword }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
