import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data ?? resp;

export const ordersService = {

  checkout: async (orderData) => {

    const body = {
      shippingAddressId: orderData.shippingAddressId
        ? Number(orderData.shippingAddressId)
        : null,
      paymentMethod: orderData.paymentMethod || "CASH",
      notes:
        orderData.notes && orderData.notes.trim() !== ""
          ? orderData.notes.trim()
          : null,
      promotionCode:
        orderData.promotionCode && orderData.promotionCode.trim() !== ""
          ? orderData.promotionCode.trim()
          : null,
      shippingFee:
        orderData.shippingFee != null && orderData.shippingFee > 0
          ? Number(orderData.shippingFee)
          : null,
    };

    if (!body.shippingAddressId) {
      delete body.shippingAddressId;
    }
    if (!body.notes) {
      delete body.notes;
    }
    if (!body.promotionCode) {
      delete body.promotionCode;
    }
    if (body.shippingFee == null) {
      delete body.shippingFee;
    }

    const validPaymentMethods = ["CASH", "PAYOS"];
    if (!validPaymentMethods.includes(body.paymentMethod)) {
      throw new Error(
        `Phương thức thanh toán không hợp lệ. Chỉ hỗ trợ: Thanh toán khi nhận hàng (CASH) hoặc Thanh toán online qua PayOS (PAYOS)`
      );
    }

    const resp = await api.post(API_ENDPOINTS.ORDERS.CHECKOUT, body);
    return unwrap(resp);
  },

  buyNow: async (orderData) => {

    if (!orderData.productId) {
      throw new Error("Vui lòng chọn sản phẩm");
    }
    if (!orderData.quantity || orderData.quantity < 1) {
      throw new Error("Số lượng phải lớn hơn 0");
    }
    if (!orderData.paymentMethod) {
      throw new Error("Vui lòng chọn phương thức thanh toán");
    }

    const validPaymentMethods = ["CASH", "PAYOS"];
    if (!validPaymentMethods.includes(orderData.paymentMethod)) {
      throw new Error(
        "Phương thức thanh toán không hợp lệ. Chỉ hỗ trợ: COD (CASH) hoặc PayOS"
      );
    }

    const body = {
      productId: orderData.productId,
      quantity: orderData.quantity,
      shippingAddressId: orderData.shippingAddressId
        ? Number(orderData.shippingAddressId)
        : null,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes || null,
      shippingFee:
        orderData.shippingFee != null && orderData.shippingFee > 0
          ? Number(orderData.shippingFee)
          : null,
      promotionCode:
        orderData.promotionCode && orderData.promotionCode.trim() !== ""
          ? orderData.promotionCode.trim()
          : null,
    };
    const resp = await api.post(API_ENDPOINTS.ORDERS.BUY_NOW, body);
    return unwrap(resp);
  },

  getMyOrders: async ({
    pageNo = 1,
    pageSize = 10,
    sortBy = "orderDate",
    sortDirection = "DESC",
    status,
    keyword,
  } = {}) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    if (status) params.status = status;
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    if (status) params.status = status;
    const resp = await api.get(API_ENDPOINTS.ORDERS.MY_ORDERS, { params });
    return unwrap(resp);
  },

  getMyOrderById: async (orderId) => {
    const resp = await api.get(API_ENDPOINTS.ORDERS.MY_ORDER_BY_ID(orderId));
    return unwrap(resp);
  },

  cancelOrder: async (orderId) => {
    const resp = await api.put(API_ENDPOINTS.ORDERS.CANCEL(orderId));
    return unwrap(resp);
  },

  confirmDelivery: async (orderId) => {
    const resp = await api.put(API_ENDPOINTS.ORDERS.CONFIRM_DELIVERY(orderId));
    return unwrap(resp);
  },
};
