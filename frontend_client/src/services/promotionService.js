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
   * @param {number} request.shippingFee - Shipping fee (optional, for SHIPPING scope)
   * @param {string} request.expectedScope - Expected scope: 'ORDER' or 'SHIPPING' (optional)
   * @returns {Promise<{valid: boolean, message: string, discount: number, discountType: string, code: string, scope: string}>}
   */
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

  /**
   * Validate shipping promotion code (convenience method)
   * @param {Object} request - Validate request
   * @param {string} request.code - Shipping promotion code
   * @param {number} request.shippingFee - Shipping fee amount
   * @returns {Promise<{valid: boolean, message: string, discount: number, discountType: string, code: string, scope: string}>}
   */
  validateShippingPromotion: async (request) => {
    const payload = {
      code: request.code,
      totalAmount: request.shippingFee, // Use shippingFee as totalAmount for min order check
      shippingFee: request.shippingFee,
      expectedScope: 'SHIPPING',
    };
    const resp = await api.post(API_ENDPOINTS.PROMOTIONS.VALIDATE, payload);
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

  /**
   * Calculate automatic shipping discount based on SHIPPING scope promotion rules
   * POST /api/v1/promotions/calculate-auto-shipping
   * @param {Object} request - Calculate request
   * @param {number} request.totalAmount - Order total amount (for minOrderAmount check)
   * @param {number} request.shippingFee - Shipping fee to apply discount to
   * @returns {Promise<{applicable: boolean, discount: number, discountType: string, ruleName: string, ruleId: number}>}
   */
  calculateAutoShippingDiscount: async (request) => {
    const resp = await api.post(API_ENDPOINTS.PROMOTIONS.CALCULATE_AUTO_SHIPPING, {
      totalAmount: request.totalAmount,
      shippingFee: request.shippingFee,
    });
    return unwrap(resp);
  },
};





