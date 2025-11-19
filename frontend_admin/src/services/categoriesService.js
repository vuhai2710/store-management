import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const categoriesService = {
  /**
   * Get all categories (without pagination)
   * GET /api/v1/categories/all
   * @returns {Promise<CategoryDTO[]>}
   */
  getAll: async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
      return unwrap(resp); // -> array
    } catch {
      // Fallback: phân trang rồi lấy content
      const resp = await api.get(API_ENDPOINTS.CATEGORIES.BASE, {
        params: { pageNo: 1, pageSize: 1000, sortBy: "idCategory", sortDirection: "ASC" },
      });
      const data = unwrap(resp);
      return Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
    }
  },

  /**
   * Get all categories with pagination
   * GET /api/v1/categories
   * @param {Object} params - Query parameters
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "idCategory")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "ASC")
   * @param {string} params.name - Search by name (optional)
   * @returns {Promise<PageResponse<CategoryDTO>>}
   */
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

  /**
   * Search categories by name
   * GET /api/v1/categories/search?name={name}
   * @param {Object} params - Query parameters
   * @param {string} params.name - Category name to search
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "idCategory")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "ASC")
   * @returns {Promise<PageResponse<CategoryDTO>>}
   */
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

  /**
   * Create category
   * POST /api/v1/categories
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Category name (required)
   * @param {string} categoryData.description - Category description (optional)
   * @returns {Promise<CategoryDTO>}
   */
  createCategory: async (categoryData) => {
    // Backend CategoryDTO expects categoryName field
    const body = {
      categoryName: categoryData.name?.trim() || categoryData.categoryName?.trim(),
      codePrefix: categoryData.codePrefix?.trim() || null,
    };
    const resp = await api.post(API_ENDPOINTS.CATEGORIES.BASE, body);
    return unwrap(resp);
  },

  /**
   * Update category
   * PUT /api/v1/categories/{id}
   * @param {number} id - Category ID
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Category name (required) - will be mapped to categoryName
   * @param {string} categoryData.codePrefix - Code prefix (optional)
   * @returns {Promise<CategoryDTO>}
   */
  updateCategory: async (id, categoryData) => {
    // Backend CategoryDTO expects categoryName field
    const body = {
      categoryName: categoryData.name?.trim() || categoryData.categoryName?.trim(),
      codePrefix: categoryData.codePrefix?.trim() || null,
    };
    const resp = await api.put(API_ENDPOINTS.CATEGORIES.BY_ID(id), body);
    return unwrap(resp);
  },

  /**
   * Delete category
   * DELETE /api/v1/categories/{id}
   * @param {number} id - Category ID
   * @returns {Promise<void>}
   */
  deleteCategory: async (id) => {
    const resp = await api.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id));
    return unwrap(resp);
  },
};