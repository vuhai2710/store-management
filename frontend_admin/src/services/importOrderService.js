import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

/**
 * Import Order Service
 * Handles all import order (purchase order) related API calls
 * Backend API: /api/v1/import-orders
 */
export const importOrderService = {
  /**
   * Get all import orders with pagination
   * GET /api/v1/import-orders
   * @param {Object} params - Query parameters
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "idImportOrder")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "DESC")
   * @returns {Promise<PageResponse<PurchaseOrderDTO>>}
   */
  getImportOrders: async (params = {}) => {
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

    const response = await api.get(API_ENDPOINTS.IMPORT_ORDERS.BASE, { params: queryParams });
    return unwrap(response);
  },

  /**
   * Get import order by ID
   * GET /api/v1/import-orders/{id}
   * @param {number} id - Import Order ID
   * @returns {Promise<PurchaseOrderDTO>}
   */
  getImportOrderById: async (id) => {
    const response = await api.get(API_ENDPOINTS.IMPORT_ORDERS.BY_ID(id));
    return unwrap(response);
  },

  /**
   * Get import orders by supplier
   * GET /api/v1/import-orders/supplier/{supplierId}
   * @param {number} supplierId - Supplier ID
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<PurchaseOrderDTO>>}
   */
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

  /**
   * Get import order history
   * GET /api/v1/import-orders/history
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date (ISO string)
   * @param {string} params.endDate - End date (ISO string)
   * @param {number} params.supplierId - Supplier ID (optional)
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "idImportOrder")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "DESC")
   * @returns {Promise<PageResponse<PurchaseOrderDTO>>}
   */
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

    const response = await api.get(API_ENDPOINTS.IMPORT_ORDERS.HISTORY, { params: queryParams });
    return unwrap(response);
  },

  /**
   * Create import order
   * POST /api/v1/import-orders
   * @param {Object} importOrderData - Import order data
   * @returns {Promise<PurchaseOrderDTO>}
   */
  createImportOrder: async (importOrderData) => {
    const response = await api.post(API_ENDPOINTS.IMPORT_ORDERS.BASE, importOrderData);
    return unwrap(response);
  },

  /**
   * Export import order to PDF
   * GET /api/v1/import-orders/{id}/pdf
   * @param {number} id - Import Order ID
   * @returns {Promise<Blob>}
   */
  exportImportOrderToPdf: async (id) => {
    const response = await api.get(API_ENDPOINTS.IMPORT_ORDERS.PDF(id), {
      responseType: "blob",
    });
    return response.data;
  },
};


