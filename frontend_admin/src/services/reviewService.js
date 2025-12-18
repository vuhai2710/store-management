import api from "./api";

const unwrap = (resp) => resp?.data ?? resp;

export const reviewService = {

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

  getReviewById: async (reviewId) => {
    const resp = await api.get(`/admin/reviews/${reviewId}`);
    return unwrap(resp);
  },

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

  replyToReview: async (reviewId, adminReply) => {
    const resp = await api.post(`/admin/reviews/${reviewId}/reply`, {
      adminReply,
    });
    return unwrap(resp);
  },

  deleteReview: async (reviewId) => {
    const resp = await api.delete(`/admin/reviews/${reviewId}`);
    return unwrap(resp);
  },
};
