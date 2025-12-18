import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const paymentService = {

  createPayOSPaymentLink: async (orderId) => {
    const resp = await api.post(API_ENDPOINTS.PAYMENTS.PAYOS.CREATE(orderId));
    return unwrap(resp);
  },

  getPayOSPaymentStatus: async (orderId) => {
    const resp = await api.get(API_ENDPOINTS.PAYMENTS.PAYOS.STATUS(orderId));
    return unwrap(resp);
  },
};
