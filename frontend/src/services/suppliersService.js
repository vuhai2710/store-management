import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const suppliersService = {
  getAllSuppliers: async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.SUPPLIERS.GET_ALL);
      return unwrap(resp); // -> array
    } catch {
      const resp = await api.get(API_ENDPOINTS.SUPPLIERS.BASE, {
        params: { pageNo: 1, pageSize: 1000, sortBy: "idSupplier", sortDirection: "ASC" },
      });
      const data = unwrap(resp);
      return Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
    }
  },

  createSupplier: async (supplierData) => {
    const resp = await api.post(API_ENDPOINTS.SUPPLIERS.BASE, supplierData);
    return unwrap(resp);
  },

  updateSupplier: async (id, supplierData) => {
    const resp = await api.put(API_ENDPOINTS.SUPPLIERS.BY_ID(id), supplierData);
    return unwrap(resp);
  },

  deleteSupplier: async (id) => {
    const resp = await api.delete(API_ENDPOINTS.SUPPLIERS.BY_ID(id));
    return unwrap(resp);
  },
};
