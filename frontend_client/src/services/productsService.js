import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const productsService = {
  /**
   * Get products with pagination and filters
   * GET /api/v1/products
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<ProductDTO>>}
   */
  getProducts: async ({
    pageNo = 1,
    pageSize = 10,
    sortBy = 'idProduct',
    sortDirection = 'ASC',
    code,
    name,
    categoryId,
    brand,
    minPrice,
    maxPrice,
    inventoryStatus,
  } = {}) => {
    try {
      const params = {
        pageNo,
        pageSize,
        sortBy,
        sortDirection,
      };
      if (code) params.code = code;
      if (name) params.name = name;
      if (categoryId) params.categoryId = categoryId;
      if (brand) params.brand = brand;
      if (minPrice != null) params.minPrice = minPrice;
      if (maxPrice != null) params.maxPrice = maxPrice;
      if (inventoryStatus) params.inventoryStatus = inventoryStatus;

      const resp = await api.get(API_ENDPOINTS.PRODUCTS.BASE, { params });
      return unwrap(resp);
    } catch (error) {
      // If 401, return empty result (public endpoint should not require auth)
      if (error?.status === 401) {
        console.warn('Products endpoint requires authentication, returning empty result');
        return { content: [], totalPages: 0, totalElements: 0 };
      }
      console.error('Error fetching products:', error);
      return { content: [], totalPages: 0, totalElements: 0 };
    }
  },

  /**
   * Get product by ID
   * GET /api/v1/products/{id}
   * @param {number} id - Product ID
   * @returns {Promise<ProductDTO>}
   */
  getProductById: async (id) => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return unwrap(resp);
  },

  /**
   * Search products by name
   * GET /api/v1/products/search/name
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<ProductDTO>>}
   */
  searchProductsByName: async ({
    name,
    pageNo = 1,
    pageSize = 10,
    sortBy = 'idProduct',
    sortDirection = 'ASC',
  } = {}) => {
    const params = { name, pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.SEARCH_BY_NAME, { params });
    return unwrap(resp);
  },

  /**
   * Get products by category
   * GET /api/v1/products/category/{categoryId}
   * @param {number} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<ProductDTO>>}
   */
  getProductsByCategory: async (categoryId, {
    pageNo = 1,
    pageSize = 10,
    sortBy = 'idProduct',
    sortDirection = 'ASC',
  } = {}) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_CATEGORY(categoryId), { params });
    return unwrap(resp);
  },

  /**
   * Get products by brand
   * GET /api/v1/products/brand/{brand}
   * @param {string} brand - Brand name
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<ProductDTO>>}
   */
  getProductsByBrand: async (brand, {
    pageNo = 1,
    pageSize = 10,
    sortBy = 'idProduct',
    sortDirection = 'ASC',
  } = {}) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_BRAND(brand), { params });
    return unwrap(resp);
  },

  /**
   * Get products by price range
   * GET /api/v1/products/price
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<ProductDTO>>}
   */
  getProductsByPriceRange: async ({
    minPrice,
    maxPrice,
    pageNo = 1,
    pageSize = 10,
    sortBy = 'price',
    sortDirection = 'ASC',
  } = {}) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    if (minPrice != null) params.minPrice = minPrice;
    if (maxPrice != null) params.maxPrice = maxPrice;
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_PRICE, { params });
    return unwrap(resp);
  },

  /**
   * Get best selling products
   * GET /api/v1/products/best-sellers
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<ProductDTO>>}
   */
  getBestSellingProducts: async ({
    status,
    pageNo = 1,
    pageSize = 10,
  } = {}) => {
    const params = { pageNo, pageSize };
    if (status) params.status = status;
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BEST_SELLERS, { params });
    return unwrap(resp);
  },

  /**
   * Get top 5 best selling products
   * GET /api/v1/products/best-sellers/top-5
   * @param {Object} params - Query parameters
   * @returns {Promise<ProductDTO[]>}
   */
  getTop5BestSellingProducts: async ({ status } = {}) => {
    try {
      const params = {};
      if (status) params.status = status;
      const resp = await api.get(API_ENDPOINTS.PRODUCTS.TOP_5_BEST_SELLERS, { params });
      return unwrap(resp);
    } catch (error) {
      // If 401, return empty array (public endpoint should not require auth)
      if (error?.status === 401) {
        console.warn('Best sellers endpoint requires authentication, returning empty array');
        return [];
      }
      console.error('Error fetching best selling products:', error);
      return [];
    }
  },

  /**
   * Get new products
   * GET /api/v1/products/new
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<ProductDTO>>}
   */
  getNewProducts: async ({
    pageNo = 1,
    pageSize = 10,
    limit,
  } = {}) => {
    try {
      const params = { pageNo, pageSize };
      if (limit) params.limit = limit;
      const resp = await api.get(API_ENDPOINTS.PRODUCTS.NEW_PRODUCTS, { params });
      return unwrap(resp);
    } catch (error) {
      // If 401, return empty result (public endpoint should not require auth)
      if (error?.status === 401) {
        console.warn('New products endpoint requires authentication, returning empty result');
        return { content: [], totalPages: 0, totalElements: 0 };
      }
      console.error('Error fetching new products:', error);
      return { content: [], totalPages: 0, totalElements: 0 };
    }
  },

  /**
   * Get related products
   * GET /api/v1/products/{id}/related
   * @param {number} id - Product ID
   * @param {Object} params - Query parameters
   * @returns {Promise<ProductDTO[]>}
   */
  getRelatedProducts: async (id, { limit = 8 } = {}) => {
    const params = { limit };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.RELATED(id), { params });
    return unwrap(resp);
  },

  /**
   * Get all brands
   * GET /api/v1/products/brands
   * @returns {Promise<string[]>}
   */
  getAllBrands: async () => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BRANDS);
    return unwrap(resp);
  },

  /**
   * Get product images
   * GET /api/v1/products/{id}/images
   * @param {number} id - Product ID
   * @returns {Promise<ProductImageDTO[]>}
   */
  getProductImages: async (id) => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.IMAGES(id));
    return unwrap(resp);
  },
};


