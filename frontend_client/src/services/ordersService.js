import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data ?? resp;

export const ordersService = {
  /**
   * Checkout - Create order from cart
   * POST /api/v1/orders/checkout
   * @param {Object} orderData - Order data
   * @param {number} orderData.shippingAddressId - Shipping address ID (optional)
   * @param {string} orderData.paymentMethod - Payment method (CASH, TRANSFER, ZALOPAY, PAYOS)
   * @param {string} orderData.notes - Order note (optional)
   * @returns {Promise<OrderDTO>}
   */
  checkout: async (orderData) => {
    // Validate and format data
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
          : null, // Phí giao hàng từ GHN
    };

    // Remove null/undefined fields if not required
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

    // Validate payment method - chỉ hỗ trợ CASH và PAYOS
    const validPaymentMethods = ["CASH", "PAYOS"];
    if (!validPaymentMethods.includes(body.paymentMethod)) {
      throw new Error(
        `Phương thức thanh toán không hợp lệ. Chỉ hỗ trợ: Thanh toán khi nhận hàng (CASH) hoặc Thanh toán online qua PayOS (PAYOS)`
      );
    }

    const resp = await api.post(API_ENDPOINTS.ORDERS.CHECKOUT, body);
    return unwrap(resp);
  },

  /**
   * Buy now - Create order directly from product
   * POST /api/v1/orders/buy-now
   * @param {Object} orderData - Order data
   * @param {number} orderData.productId - Product ID
   * @param {number} orderData.quantity - Quantity
   * @param {number} orderData.shippingAddressId - Shipping address ID (optional)
   * @param {string} orderData.paymentMethod - Payment method (CASH, PAYOS)
   * @param {string} orderData.notes - Order note (optional)
   * @param {number} orderData.shippingFee - Shipping fee from GHN (optional)
   * @param {string} orderData.promotionCode - Promotion code (optional)
   * @returns {Promise<OrderDTO>}
   */
  buyNow: async (orderData) => {
    // Validate required fields
    if (!orderData.productId) {
      throw new Error("Vui lòng chọn sản phẩm");
    }
    if (!orderData.quantity || orderData.quantity < 1) {
      throw new Error("Số lượng phải lớn hơn 0");
    }
    if (!orderData.paymentMethod) {
      throw new Error("Vui lòng chọn phương thức thanh toán");
    }

    // Validate payment method
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

  /**
   * Get my orders
   * GET /api/v1/orders/my-orders
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<OrderDTO>>}
   */
  getMyOrders: async ({
    pageNo = 1,
    pageSize = 10,
    sortBy = "orderDate",
    sortDirection = "DESC",
    status,
  } = {}) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    if (status) params.status = status;
    const resp = await api.get(API_ENDPOINTS.ORDERS.MY_ORDERS, { params });
    return unwrap(resp);
  },

  /**
   * Get my order by ID
   * GET /api/v1/orders/my-orders/{orderId}
   * @param {number} orderId - Order ID
   * @returns {Promise<OrderDTO>}
   */
  getMyOrderById: async (orderId) => {
    const resp = await api.get(API_ENDPOINTS.ORDERS.MY_ORDER_BY_ID(orderId));
    return unwrap(resp);
  },

  /**
   * Cancel order
   * PUT /api/v1/orders/my-orders/{orderId}/cancel
   * @param {number} orderId - Order ID
   * @returns {Promise<OrderDTO>}
   */
  cancelOrder: async (orderId) => {
    const resp = await api.put(API_ENDPOINTS.ORDERS.CANCEL(orderId));
    return unwrap(resp);
  },

  /**
   * Confirm delivery
   * PUT /api/v1/orders/my-orders/{orderId}/confirm-delivery
   * @param {number} orderId - Order ID
   * @returns {Promise<OrderDTO>}
   */
  confirmDelivery: async (orderId) => {
    const resp = await api.put(API_ENDPOINTS.ORDERS.CONFIRM_DELIVERY(orderId));
    return unwrap(resp);
  },
};
