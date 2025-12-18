import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const productsService = {

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

      if (error?.status === 401) {
        console.warn('Products endpoint requires authentication, returning empty result');
        return { content: [], totalPages: 0, totalElements: 0 };
      }
      console.error('Error fetching products:', error);
      return { content: [], totalPages: 0, totalElements: 0 };
    }
  },

  getProductById: async (id) => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return unwrap(resp);
  },

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



  getTop5BestSellingProducts: async ({ status } = {}) => {
    try {
      const params = {};
      if (status) params.status = status;
      const resp = await api.get(API_ENDPOINTS.PRODUCTS.TOP_5_BEST_SELLERS, { params });
      return unwrap(resp);
    } catch (error) {

      if (error?.status === 401) {
        console.warn('Best sellers endpoint requires authentication, returning empty array');
        return [];
      }
      console.error('Error fetching best selling products:', error);
      return [];
    }
  },

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

      if (error?.status === 401) {
        console.warn('New products endpoint requires authentication, returning empty result');
        return { content: [], totalPages: 0, totalElements: 0 };
      }
      console.error('Error fetching new products:', error);
      return { content: [], totalPages: 0, totalElements: 0 };
    }
  },

  getRelatedProducts: async (id, { limit = 8 } = {}) => {
    const params = { limit };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.RELATED(id), { params });
    return unwrap(resp);
  },

  getAllBrands: async () => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BRANDS);
    return unwrap(resp);
  },

  getProductImages: async (id) => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.IMAGES(id));
    return unwrap(resp);
  },

  getRecommendedProducts: async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.PRODUCTS.RECOMMEND);
      const unwrapped = unwrap(resp);

      return unwrapped?.data || unwrapped || [];
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      return [];
    }
  },

  getSimilarProducts: async (id) => {
    try {
      const resp = await api.get(API_ENDPOINTS.PRODUCTS.SIMILAR(id));
      const unwrapped = unwrap(resp);

      return unwrapped?.data || unwrapped || [];
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
  },

  getProductsOnSale: async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.PRODUCTS.ON_SALE);
      return unwrap(resp);
    } catch (error) {

      if (error?.status === 401) {
        console.warn('Products on sale endpoint requires authentication, returning empty array');
        return [];
      }
      console.error('Error fetching products on sale:', error);
      return [];
    }
  },
};
