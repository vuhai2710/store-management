import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const promotionService = {
  /**
   * Validate promotion code
   * POST /api/v1/promotions/validate
   * @param {Object} request - Validate request
   * @param {string} request.code - Promotion code
   * @param {number} request.totalAmount - Order total amount
   * @returns {Promise<{valid: boolean, message: string, discount: number, discountType: string, code: string}>}
   */
  validatePromotion: async (request) => {
    const resp = await api.post(API_ENDPOINTS.PROMOTIONS.VALIDATE, {
      code: request.code,
      totalAmount: request.totalAmount,
    });
    return unwrap(resp);
  },

  /**
   * Calculate automatic discount
   * POST /api/v1/promotions/calculate
   * @param {Object} request - Calculate request
   * @param {number} request.totalAmount - Order total amount
   * @param {Array} request.items - Order items (optional)
   * @returns {Promise<{applicable: boolean, discount: number, discountType: string, ruleName: string, ruleId: number}>}
   */
  calculateDiscount: async (request) => {
    const resp = await api.post(API_ENDPOINTS.PROMOTIONS.CALCULATE, {
      totalAmount: request.totalAmount,
      items: request.items || [],
    });
    return unwrap(resp);
  },
};


