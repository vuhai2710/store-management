import api from "./api";

/**
 * Review Service cho Admin
 * Quản lý đánh giá sản phẩm
 *
 * NOTE: axios baseURL already contains /api/v1
 * DO NOT prefix /api/v1 again in API calls
 */

const unwrap = (resp) => resp?.data ?? resp;

export const reviewService = {
  /**
   * Get all reviews (Admin/Employee)
   * GET /admin/reviews (baseURL already has /api/v1)
   */
  getAllReviews: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "DESC",
    } = params;
    const queryParams = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get("/admin/reviews", { params: queryParams });
    return unwrap(resp);
  },

  /**
   * Get review by ID (Admin/Employee)
   * GET /admin/reviews/{reviewId}
   */
  getReviewById: async (reviewId) => {
    const resp = await api.get(`/admin/reviews/${reviewId}`);
    return unwrap(resp);
  },

  /**
   * Get product reviews with optional rating filter
   * GET /products/{productId}/reviews
   */
  getProductReviews: async (productId, params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      rating = null,
      sortBy = "createdAt",
      sortDirection = "DESC",
    } = params;
    const queryParams = { pageNo, pageSize, sortBy, sortDirection };
    if (rating !== null && rating !== undefined) {
      queryParams.rating = rating;
    }
    const resp = await api.get(`/products/${productId}/reviews`, {
      params: queryParams,
    });
    return unwrap(resp);
  },

  /**
   * Reply to review (Admin/Employee)
   * POST /admin/reviews/{reviewId}/reply
   */
  replyToReview: async (reviewId, adminReply) => {
    const resp = await api.post(`/admin/reviews/${reviewId}/reply`, {
      adminReply,
    });
    return unwrap(resp);
  },

  /**
   * Delete review (Admin/Employee - anytime)
   * DELETE /admin/reviews/{reviewId}
   */
  deleteReview: async (reviewId) => {
    const resp = await api.delete(`/admin/reviews/${reviewId}`);
    return unwrap(resp);
  },
};
