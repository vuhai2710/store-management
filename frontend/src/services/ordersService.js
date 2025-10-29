import api from "./api";

export const ordersService = {
  // Get all orders
  getOrders: async (params = {}) => {
    const response = await api.get("/orders", { params });

    // Endpoint này chưa có phân trang, xử lý response bình thường
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // Update order
  updateOrder: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Delete order
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Get order statistics
  getOrderStats: async (params = {}) => {
    const response = await api.get("/orders/stats", { params });
    return response.data;
  },

  // Export orders
  exportOrders: async (params = {}) => {
    const response = await api.get("/orders/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  // Print invoice
  printInvoice: async (id) => {
    const response = await api.get(`/orders/${id}/invoice`, {
      responseType: "blob",
    });
    return response.data;
  },
};
