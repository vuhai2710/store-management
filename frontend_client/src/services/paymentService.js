import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const paymentService = {
  /**
   * Create PayOS payment link
   * POST /api/v1/payments/payos/create/{orderId}
   * @param {number} orderId - Order ID
   * @returns {Promise<{paymentLinkUrl: string, paymentLinkId: string, orderId: number, qrCode?: string}>}
   */
  createPayOSPaymentLink: async (orderId) => {
    const resp = await api.post(API_ENDPOINTS.PAYMENTS.PAYOS.CREATE(orderId));
    return unwrap(resp);
  },

  /**
   * Get PayOS payment status
   * GET /api/v1/payments/payos/status/{orderId}
   * @param {number} orderId - Order ID
   * @returns {Promise<{status: string, orderId: number}>}
   */
  getPayOSPaymentStatus: async (orderId) => {
    const resp = await api.get(API_ENDPOINTS.PAYMENTS.PAYOS.STATUS(orderId));
    return unwrap(resp);
  },
};







