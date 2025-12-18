import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const promotionService = {

  validatePromotion: async (request) => {
    const payload = {
      code: request.code,
      totalAmount: request.totalAmount,
    };
    if (request.shippingFee !== undefined) {
      payload.shippingFee = request.shippingFee;
    }
    if (request.expectedScope) {
      payload.expectedScope = request.expectedScope;
    }
    const resp = await api.post(API_ENDPOINTS.PROMOTIONS.VALIDATE, payload);
    return unwrap(resp);
  },

  validateShippingPromotion: async (request) => {
    const payload = {
      code: request.code,
      totalAmount: request.shippingFee,
      shippingFee: request.shippingFee,
      expectedScope: 'SHIPPING',
    };
    const resp = await api.post(API_ENDPOINTS.PROMOTIONS.VALIDATE, payload);
    return unwrap(resp);
  },

  calculateDiscount: async (request) => {
    const resp = await api.post(API_ENDPOINTS.PROMOTIONS.CALCULATE, {
      totalAmount: request.totalAmount,
      items: request.items || [],
    });
    return unwrap(resp);
  },

  calculateAutoShippingDiscount: async (request) => {
    const resp = await api.post(API_ENDPOINTS.PROMOTIONS.CALCULATE_AUTO_SHIPPING, {
      totalAmount: request.totalAmount,
      shippingFee: request.shippingFee,
    });
    return unwrap(resp);
  },
};
