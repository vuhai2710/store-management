import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const reviewService = {
  /**
   * Create review for a product
   * POST /api/v1/products/{productId}/reviews
   * @param {number} productId - Product ID
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.orderDetailId - Order detail ID
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.comment - Comment
   * @returns {Promise<ProductReviewDTO>}
   */
  createReview: async (productId, reviewData) => {
    const resp = await api.post(API_ENDPOINTS.REVIEWS.CREATE(productId), reviewData);
    return unwrap(resp);
  },

  /**
   * Get product reviews
   * GET /api/v1/products/{productId}/reviews
   * @param {number} productId - Product ID
   * @param {Object} params - Query parameters
   * @param {number} params.pageNo - Page number
   * @param {number} params.pageSize - Page size
   * @param {number} params.rating - Filter by rating (optional)
   * @param {string} params.sortBy - Sort by field
   * @param {string} params.sortDirection - Sort direction (ASC/DESC)
   * @returns {Promise<PageResponse<ProductReviewDTO>>}
   */
  getProductReviews: async (productId, params = {}) => {
    const { pageNo = 1, pageSize = 10, rating = null, sortBy = 'createdAt', sortDirection = 'DESC' } = params;
    const queryParams = { pageNo, pageSize, sortBy, sortDirection };
    if (rating !== null && rating !== undefined) {
      queryParams.rating = rating;
    }
    const resp = await api.get(API_ENDPOINTS.REVIEWS.GET_PRODUCT_REVIEWS(productId), { params: queryParams });
    return unwrap(resp);
  },

  /**
   * Get my reviews
   * GET /api/v1/reviews/my-reviews
   * @param {Object} params - Query parameters
   * @param {number} params.pageNo - Page number
   * @param {number} params.pageSize - Page size
   * @param {string} params.sortBy - Sort by field
   * @param {string} params.sortDirection - Sort direction (ASC/DESC)
   * @returns {Promise<PageResponse<ProductReviewDTO>>}
   */
  getMyReviews: async (params = {}) => {
    const { pageNo = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = 'DESC' } = params;
    const queryParams = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.REVIEWS.GET_MY_REVIEWS, { params: queryParams });
    return unwrap(resp);
  },

  /**
   * Update review
   * PUT /api/v1/reviews/{reviewId}
   * @param {number} reviewId - Review ID
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.comment - Comment
   * @returns {Promise<ProductReviewDTO>}
   */
  updateReview: async (reviewId, reviewData) => {
    const resp = await api.put(API_ENDPOINTS.REVIEWS.UPDATE(reviewId), reviewData);
    return unwrap(resp);
  },

  /**
   * Delete review
   * DELETE /api/v1/reviews/{reviewId}
   * @param {number} reviewId - Review ID
   * @returns {Promise<void>}
   */
  deleteReview: async (reviewId) => {
    const resp = await api.delete(API_ENDPOINTS.REVIEWS.DELETE(reviewId));
    return unwrap(resp);
  },
};




