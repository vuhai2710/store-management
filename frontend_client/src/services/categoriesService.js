import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const categoriesService = {

  getAll: async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
      return unwrap(resp);
    } catch (error) {

      if (error?.status === 401) {
        console.warn('Categories endpoint requires authentication, returning empty array');
        return [];
      }
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  getCategoryById: async (id) => {
    const resp = await api.get(API_ENDPOINTS.CATEGORIES.BY_ID(id));
    return unwrap(resp);
  },
};
