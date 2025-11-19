import api from "./api";

/**
 * Review Service cho Admin
 * Quản lý đánh giá sản phẩm
 */

const unwrap = (resp) => resp?.data ?? resp;

export const reviewService = {
  /**
   * Get all reviews (Admin/Employee)
   * GET /api/v1/admin/reviews
   */
  getAllReviews: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "DESC",
    } = params;
    const queryParams = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get("/api/v1/admin/reviews", {
      params: queryParams,
    });
    return unwrap(resp);
  },

  /**
   * Get review by ID (Admin/Employee)
   * GET /api/v1/admin/reviews/{reviewId}
   */
  getReviewById: async (reviewId) => {
    const resp = await api.get(`/api/v1/admin/reviews/${reviewId}`);
    return unwrap(resp);
  },

  /**
   * Get product reviews with optional rating filter
   * GET /api/v1/products/{productId}/reviews
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
    const resp = await api.get(`/api/v1/products/${productId}/reviews`, {
      params: queryParams,
    });
    return unwrap(resp);
  },

  /**
   * Reply to review (Admin/Employee)
   * POST /api/v1/admin/reviews/{reviewId}/reply
   */
  replyToReview: async (reviewId, adminReply) => {
    const resp = await api.post(`/api/v1/admin/reviews/${reviewId}/reply`, {
      adminReply,
    });
    return unwrap(resp);
  },

  /**
   * Delete review (Admin/Employee - anytime)
   * DELETE /api/v1/admin/reviews/{reviewId}
   */
  deleteReview: async (reviewId) => {
    const resp = await api.delete(`/api/v1/admin/reviews/${reviewId}`);
    return unwrap(resp);
  },
};
