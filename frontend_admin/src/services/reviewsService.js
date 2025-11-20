import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const reviewsService = {
  /**
   * Lấy danh sách reviews của sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {object} params - { pageNo, pageSize, sortBy, sortDirection }
   */
  getProductReviews: async (productId, params = {}) => {
    const { pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC" } = params;
    const response = await api.get(API_ENDPOINTS.REVIEWS.PRODUCT_REVIEWS(productId), {
      params: { pageNo, pageSize, sortBy, sortDirection },
    });
    return response.data?.data || response.data;
  },

  /**
   * Lấy tất cả reviews (Admin/Employee)
   * @param {object} params - { pageNo, pageSize, sortBy, sortDirection }
   */
  getAllReviews: async (params = {}) => {
    const { pageNo = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "DESC" } = params;
    const response = await api.get(API_ENDPOINTS.REVIEWS.ALL_REVIEWS, {
      params: { pageNo, pageSize, sortBy, sortDirection },
    });
    return response.data?.data || response.data;
  },

  /**
   * Lấy chi tiết review theo ID (Admin/Employee)
   * @param {number} reviewId - ID review
   */
  getReviewById: async (reviewId) => {
    const response = await api.get(API_ENDPOINTS.REVIEWS.REVIEW_BY_ID(reviewId));
    return response.data?.data || response.data;
  },

  /**
   * Xóa review (Admin/Employee)
   * @param {number} reviewId - ID review
   */
  deleteReview: async (reviewId) => {
    const response = await api.delete(API_ENDPOINTS.REVIEWS.DELETE_REVIEW(reviewId));
    return response.data;
  },
};

export { reviewsService };

