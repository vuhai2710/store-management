import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const reviewsService = {

  getProductReviews: async (productId, params = {}) => {
    const { pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC" } = params;
    const response = await api.get(API_ENDPOINTS.REVIEWS.PRODUCT_REVIEWS(productId), {
      params: { pageNo, pageSize, sortBy, sortDirection },
    });
    return response.data?.data || response.data;
  },

  getAllReviews: async (params = {}) => {
    const { pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC" } = params;
    const response = await api.get(API_ENDPOINTS.REVIEWS.ALL_REVIEWS, {
      params: { pageNo, pageSize, sortBy, sortDirection },
    });
    return response.data?.data || response.data;
  },

  getReviewById: async (reviewId) => {
    const response = await api.get(API_ENDPOINTS.REVIEWS.REVIEW_BY_ID(reviewId));
    return response.data?.data || response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(API_ENDPOINTS.REVIEWS.DELETE_REVIEW(reviewId));
    return response.data;
  },

  replyToReview: async (reviewId, adminReply) => {
    const response = await api.post(API_ENDPOINTS.REVIEWS.REPLY_REVIEW(reviewId), { adminReply });
    return response.data?.data || response.data;
  },
};

export { reviewsService };
