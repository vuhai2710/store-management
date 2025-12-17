import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const promotionsService = {

  getAllPromotions: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "DESC",
      keyword,
      scope,
    } = params;
    const queryParams = { pageNo, pageSize, sortBy, sortDirection };
    if (keyword && keyword.trim()) {
      queryParams.keyword = keyword.trim();
    }
    if (scope) {
      queryParams.scope = scope;
    }
    const response = await api.get(API_ENDPOINTS.PROMOTIONS.BASE, {
      params: queryParams,
    });
    return response.data?.data || response.data;
  },

  getPromotionById: async (id) => {
    const response = await api.get(API_ENDPOINTS.PROMOTIONS.BY_ID(id));
    return response.data?.data || response.data;
  },

  createPromotion: async (promotionData) => {
    const response = await api.post(
      API_ENDPOINTS.PROMOTIONS.BASE,
      promotionData
    );
    return response.data?.data || response.data;
  },

  updatePromotion: async (id, promotionData) => {
    const response = await api.put(
      API_ENDPOINTS.PROMOTIONS.BY_ID(id),
      promotionData
    );
    return response.data?.data || response.data;
  },

  deletePromotion: async (id) => {
    const response = await api.delete(API_ENDPOINTS.PROMOTIONS.BY_ID(id));
    return response.data;
  },

  getAllPromotionRules: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "DESC",
      keyword,
    } = params;
    const queryParams = { pageNo, pageSize, sortBy, sortDirection };
    if (keyword && keyword.trim()) {
      queryParams.keyword = keyword.trim();
    }
    const response = await api.get(API_ENDPOINTS.PROMOTIONS.RULES, {
      params: queryParams,
    });
    return response.data?.data || response.data;
  },

  getPromotionRuleById: async (id) => {
    const response = await api.get(API_ENDPOINTS.PROMOTIONS.RULE_BY_ID(id));
    return response.data?.data || response.data;
  },

  createPromotionRule: async (ruleData) => {
    const response = await api.post(API_ENDPOINTS.PROMOTIONS.RULES, ruleData);
    return response.data?.data || response.data;
  },

  updatePromotionRule: async (id, ruleData) => {
    const response = await api.put(
      API_ENDPOINTS.PROMOTIONS.RULE_BY_ID(id),
      ruleData
    );
    return response.data?.data || response.data;
  },

  deletePromotionRule: async (id) => {
    const response = await api.delete(API_ENDPOINTS.PROMOTIONS.RULE_BY_ID(id));
    return response.data;
  },
};

export { promotionsService };
