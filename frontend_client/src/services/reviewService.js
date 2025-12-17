import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const reviewService = {

  createReview: async (productId, reviewData) => {
    const resp = await api.post(API_ENDPOINTS.REVIEWS.CREATE(productId), reviewData);
    return unwrap(resp);
  },

  getProductReviews: async (productId, params = {}) => {
    const { pageNo = 1, pageSize = 10, rating = null, sortBy = 'createdAt', sortDirection = 'DESC' } = params;
    const queryParams = { pageNo, pageSize, sortBy, sortDirection };
    if (rating !== null && rating !== undefined) {
      queryParams.rating = rating;
    }
    const resp = await api.get(API_ENDPOINTS.REVIEWS.GET_PRODUCT_REVIEWS(productId), { params: queryParams });
    return unwrap(resp);
  },

  getMyReviews: async (params = {}) => {
    const { pageNo = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = 'DESC' } = params;
    const queryParams = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.REVIEWS.GET_MY_REVIEWS, { params: queryParams });
    return unwrap(resp);
  },

  updateReview: async (reviewId, reviewData) => {
    const resp = await api.put(API_ENDPOINTS.REVIEWS.UPDATE(reviewId), reviewData);
    return unwrap(resp);
  },

  deleteReview: async (reviewId) => {
    const resp = await api.delete(API_ENDPOINTS.REVIEWS.DELETE(reviewId));
    return unwrap(resp);
  },
};
