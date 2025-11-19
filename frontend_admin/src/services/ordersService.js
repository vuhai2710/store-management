import api from "./api";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

/**
 * Orders Service
 * Handles all order-related API calls
 * Backend API: /api/v1/orders
 */
export const ordersService = {
  /**
   * Get all orders with pagination and filters
   * GET /api/v1/orders
   * @param {Object} params - Query parameters
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "orderDate")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "DESC")
   * @param {string} params.status - Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELED)
   * @param {number} params.customerId - Filter by customer ID
   * @returns {Promise<PageResponse<OrderDTO>>}
   */
  getOrders: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "orderDate",
      sortDirection = "DESC",
      status,
      customerId,
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (status) queryParams.status = status;
    if (customerId) queryParams.customerId = customerId;

    const response = await api.get("/orders", { params: queryParams });
    return unwrap(response); // Returns PageResponse<OrderDTO>
  },

  /**
   * Get order by ID
   * GET /api/v1/orders/{id}
   * @param {number} id - Order ID
   * @returns {Promise<OrderDTO>}
   */
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return unwrap(response);
  },

  /**
   * Create order for customer (Admin/Employee only)
   * POST /api/v1/orders/create-for-customer
   * @param {OrderDTO} orderData - Order data
   * @returns {Promise<OrderDTO>}
   */
  createOrder: async (orderData) => {
    const response = await api.post("/orders/create-for-customer", orderData);
    return unwrap(response);
  },

  /**
   * Update order status
   * PUT /api/v1/orders/{id}/status
   * @param {number} id - Order ID
   * @param {string} status - Order status (PENDING, CONFIRMED, COMPLETED, CANCELED)
   * @returns {Promise<OrderDTO>}
   */
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return unwrap(response);
  },

  /**
   * Export order to PDF (Invoice)
   * GET /api/v1/orders/{id}/pdf
   * @param {number} id - Order ID
   * @returns {Promise<Blob>}
   */
  exportOrderToPdf: async (id) => {
    const response = await api.get(`/orders/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Legacy methods (kept for backward compatibility, may not be used)
  
  /**
   * Update order (Not available in backend - kept for compatibility)
   * @deprecated Backend doesn't support direct order update
   */
  updateOrder: async (id, orderData) => {
    console.warn("updateOrder is deprecated. Use updateOrderStatus instead.");
    // Backend doesn't have update order endpoint, only status update
    throw new Error("Update order is not supported. Use updateOrderStatus instead.");
  },

  /**
   * Delete order (Not available in backend - kept for compatibility)
   * @deprecated Backend doesn't support order deletion
   */
  deleteOrder: async (id) => {
    console.warn("deleteOrder is deprecated. Backend doesn't support order deletion.");
    throw new Error("Delete order is not supported by backend.");
  },

  /**
   * Get order statistics (Not available in backend - kept for compatibility)
   * @deprecated Backend doesn't have stats endpoint
   */
  getOrderStats: async (params = {}) => {
    console.warn("getOrderStats is deprecated. Backend doesn't have stats endpoint.");
    // Calculate stats from orders list if needed
    return null;
  },

  /**
   * Export orders (Not available in backend - kept for compatibility)
   * @deprecated Backend doesn't have bulk export endpoint
   */
  exportOrders: async (params = {}) => {
    console.warn("exportOrders is deprecated. Backend doesn't have bulk export endpoint.");
    throw new Error("Bulk export is not supported. Use exportOrderToPdf for individual orders.");
  },

  /**
   * Print invoice (alias for exportOrderToPdf)
   * @param {number} id - Order ID
   * @returns {Promise<Blob>}
   */
  printInvoice: async (id) => {
    return ordersService.exportOrderToPdf(id);
  },
};
