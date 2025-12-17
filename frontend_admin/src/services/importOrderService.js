import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const importOrderService = {

  getImportOrders: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "idImportOrder",
      sortDirection = "DESC",
      supplierId,
      startDate,
      endDate,
      keyword,
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (keyword && keyword.trim()) {
      queryParams.keyword = keyword.trim();
    }

    let endpoint = API_ENDPOINTS.IMPORT_ORDERS.BASE;
    const hasDateFilter = startDate || endDate;

    if (hasDateFilter) {

      endpoint =
        API_ENDPOINTS.IMPORT_ORDERS.HISTORY ||
        `${API_ENDPOINTS.IMPORT_ORDERS.BASE}/history`;

      if (supplierId) {
        queryParams.supplierId = supplierId;
      }
      if (startDate) {
        queryParams.startDate = startDate;
      }
      if (endDate) {
        queryParams.endDate = endDate;
      }
    } else if (supplierId) {

      endpoint = API_ENDPOINTS.IMPORT_ORDERS.BY_SUPPLIER(supplierId);
    }

    const response = await api.get(endpoint, { params: queryParams });
    return unwrap(response);
  },

  getImportOrderById: async (id) => {
    const response = await api.get(API_ENDPOINTS.IMPORT_ORDERS.BY_ID(id));
    return unwrap(response);
  },

  getImportOrdersBySupplier: async (supplierId, params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "idImportOrder",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    const response = await api.get(
      API_ENDPOINTS.IMPORT_ORDERS.BY_SUPPLIER(supplierId),
      { params: queryParams }
    );
    return unwrap(response);
  },

  getImportOrderHistory: async (params = {}) => {
    const {
      startDate,
      endDate,
      supplierId,
      pageNo = 1,
      pageSize = 10,
      sortBy = "idImportOrder",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;
    if (supplierId) queryParams.supplierId = supplierId;

    const response = await api.get(API_ENDPOINTS.IMPORT_ORDERS.HISTORY, {
      params: queryParams,
    });
    return unwrap(response);
  },

  createImportOrder: async (importOrderData) => {
    const response = await api.post(
      API_ENDPOINTS.IMPORT_ORDERS.BASE,
      importOrderData
    );
    return unwrap(response);
  },

  exportImportOrderToPdf: async (id) => {
    const response = await api.get(API_ENDPOINTS.IMPORT_ORDERS.PDF(id), {
      responseType: "blob",
    });
    return response.data;
  },
};
