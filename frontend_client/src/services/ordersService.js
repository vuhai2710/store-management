import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

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
      shippingAddressId: orderData.shippingAddressId ? Number(orderData.shippingAddressId) : null,
      paymentMethod: orderData.paymentMethod || 'CASH',
      notes: orderData.notes && orderData.notes.trim() !== '' ? orderData.notes.trim() : null,
      promotionCode: orderData.promotionCode && orderData.promotionCode.trim() !== '' ? orderData.promotionCode.trim() : null,
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
    
    // Validate payment method - chỉ hỗ trợ CASH và PAYOS
    const validPaymentMethods = ['CASH', 'PAYOS'];
    if (!validPaymentMethods.includes(body.paymentMethod)) {
      throw new Error(`Phương thức thanh toán không hợp lệ. Chỉ hỗ trợ: Thanh toán khi nhận hàng (CASH) hoặc Thanh toán online qua PayOS (PAYOS)`);
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
   * @param {string} orderData.paymentMethod - Payment method (CASH, TRANSFER, ZALOPAY, PAYOS)
   * @param {string} orderData.notes - Order note (optional)
   * @returns {Promise<OrderDTO>}
   */
  buyNow: async (orderData) => {
    const body = {
      productId: orderData.productId,
      quantity: orderData.quantity,
      shippingAddressId: orderData.shippingAddressId,
      paymentMethod: orderData.paymentMethod || 'CASH',
      notes: orderData.notes || null,
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
    sortBy = 'orderDate',
    sortDirection = 'DESC',
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

