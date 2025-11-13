import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const promotionsService = {
  /**
   * Lấy danh sách promotions
   * @param {object} params - { pageNo, pageSize, sortBy, sortDirection }
   */
  getAllPromotions: async (params = {}) => {
    const { pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC" } = params;
    const response = await api.get(API_ENDPOINTS.PROMOTIONS.BASE, {
      params: { pageNo, pageSize, sortBy, sortDirection },
    });
    return response.data?.data || response.data;
  },

  /**
   * Lấy promotion theo ID
   * @param {number} id - ID promotion
   */
  getPromotionById: async (id) => {
    const response = await api.get(API_ENDPOINTS.PROMOTIONS.BY_ID(id));
    return response.data?.data || response.data;
  },

  /**
   * Tạo promotion mới
   * @param {object} promotionData - Dữ liệu promotion
   */
  createPromotion: async (promotionData) => {
    const response = await api.post(API_ENDPOINTS.PROMOTIONS.BASE, promotionData);
    return response.data?.data || response.data;
  },

  /**
   * Cập nhật promotion
   * @param {number} id - ID promotion
   * @param {object} promotionData - Dữ liệu promotion
   */
  updatePromotion: async (id, promotionData) => {
    const response = await api.put(API_ENDPOINTS.PROMOTIONS.BY_ID(id), promotionData);
    return response.data?.data || response.data;
  },

  /**
   * Xóa promotion
   * @param {number} id - ID promotion
   */
  deletePromotion: async (id) => {
    const response = await api.delete(API_ENDPOINTS.PROMOTIONS.BY_ID(id));
    return response.data;
  },

  /**
   * Lấy danh sách promotion rules
   * @param {object} params - { pageNo, pageSize, sortBy, sortDirection }
   */
  getAllPromotionRules: async (params = {}) => {
    const { pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC" } = params;
    const response = await api.get(API_ENDPOINTS.PROMOTIONS.RULES, {
      params: { pageNo, pageSize, sortBy, sortDirection },
    });
    return response.data?.data || response.data;
  },

  /**
   * Lấy promotion rule theo ID
   * @param {number} id - ID rule
   */
  getPromotionRuleById: async (id) => {
    const response = await api.get(API_ENDPOINTS.PROMOTIONS.RULE_BY_ID(id));
    return response.data?.data || response.data;
  },

  /**
   * Tạo promotion rule mới
   * @param {object} ruleData - Dữ liệu rule
   */
  createPromotionRule: async (ruleData) => {
    const response = await api.post(API_ENDPOINTS.PROMOTIONS.RULES, ruleData);
    return response.data?.data || response.data;
  },

  /**
   * Cập nhật promotion rule
   * @param {number} id - ID rule
   * @param {object} ruleData - Dữ liệu rule
   */
  updatePromotionRule: async (id, ruleData) => {
    const response = await api.put(API_ENDPOINTS.PROMOTIONS.RULE_BY_ID(id), ruleData);
    return response.data?.data || response.data;
  },

  /**
   * Xóa promotion rule
   * @param {number} id - ID rule
   */
  deletePromotionRule: async (id) => {
    const response = await api.delete(API_ENDPOINTS.PROMOTIONS.RULE_BY_ID(id));
    return response.data;
  },
};

export { promotionsService };

