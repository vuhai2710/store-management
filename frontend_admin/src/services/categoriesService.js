import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const categoriesService = {

  getAll: async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
      return unwrap(resp);
    } catch {

      const resp = await api.get(API_ENDPOINTS.CATEGORIES.BASE, {
        params: { pageNo: 1, pageSize: 1000, sortBy: "idCategory", sortDirection: "ASC" },
      });
      const data = unwrap(resp);
      return Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
    }
  },

  getAllCategoriesPaginated: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "idCategory",
      sortDirection = "ASC",
      name,
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (name) queryParams.name = name;

    const resp = await api.get(API_ENDPOINTS.CATEGORIES.BASE, { params: queryParams });
    return unwrap(resp);
  },

  getCategoryById: async (id) => {
    const resp = await api.get(API_ENDPOINTS.CATEGORIES.BY_ID(id));
    return unwrap(resp);
  },

  searchCategoriesByName: async (params = {}) => {
    const {
      name,
      pageNo = 1,
      pageSize = 10,
      sortBy = "idCategory",
      sortDirection = "ASC",
    } = params;

    if (!name) {
      return categoriesService.getAllCategoriesPaginated({ pageNo, pageSize, sortBy, sortDirection });
    }

    const queryParams = {
      name,
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    const resp = await api.get(API_ENDPOINTS.CATEGORIES.SEARCH, { params: queryParams });
    return unwrap(resp);
  },

  createCategory: async (categoryData) => {

    const body = {
      categoryName: categoryData.name?.trim() || categoryData.categoryName?.trim(),
      codePrefix: categoryData.codePrefix?.trim() || null,
    };
    const resp = await api.post(API_ENDPOINTS.CATEGORIES.BASE, body);
    return unwrap(resp);
  },

  updateCategory: async (id, categoryData) => {

    const body = {
      categoryName: categoryData.name?.trim() || categoryData.categoryName?.trim(),
      codePrefix: categoryData.codePrefix?.trim() || null,
    };
    const resp = await api.put(API_ENDPOINTS.CATEGORIES.BY_ID(id), body);
    return unwrap(resp);
  },

  deleteCategory: async (id) => {
    const resp = await api.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id));
    return unwrap(resp);
  },
};
