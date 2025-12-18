import api from "./api";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const ordersService = {

  getOrders: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "orderDate",
      sortDirection = "DESC",
      status,
      customerId,
      keyword,
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (status) queryParams.status = status;
    if (customerId) queryParams.customerId = customerId;
    if (keyword) queryParams.keyword = keyword;

    const response = await api.get("/orders", { params: queryParams });
    return unwrap(response);
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return unwrap(response);
  },

  createOrder: async (orderData) => {
    const response = await api.post("/orders/create-for-customer", orderData);
    return unwrap(response);
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return unwrap(response);
  },

  exportOrderToPdf: async (id) => {
    const response = await api.get(`/orders/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },









  printInvoice: async (id) => {
    return ordersService.exportOrderToPdf(id);
  },
};
