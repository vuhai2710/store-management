import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const categoriesService = {
  /**
   * Get all categories (without pagination)
   * GET /api/v1/categories/all
   * @returns {Promise<CategoryDTO[]>}
   */
  getAll: async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
      return unwrap(resp); // Returns array
    } catch (error) {
      // If 401, return empty array (public endpoint should not require auth)
      if (error?.status === 401) {
        console.warn('Categories endpoint requires authentication, returning empty array');
        return [];
      }
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Get category by ID
   * GET /api/v1/categories/{id}
   * @param {number} id - Category ID
   * @returns {Promise<CategoryDTO>}
   */
  getCategoryById: async (id) => {
    const resp = await api.get(API_ENDPOINTS.CATEGORIES.BY_ID(id));
    return unwrap(resp);
  },
};


