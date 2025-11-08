import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const productsService = {
  getProductsPaginated: async ({
    pageNo = 1,
    pageSize = 10,
    sortBy = "idProduct",
    sortDirection = "ASC",
    code,
    name,
    categoryId,
    brand,
    minPrice,
    maxPrice,
  } = {}) => {
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

    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BASE, { params });
    return unwrap(resp);
  },

  getProductById: async (id) => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return unwrap(resp);
  },

  getProductByCode: async (code) => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.CODE(code));
    return unwrap(resp);
  },

  getProductsByCategory: async (categoryId, { pageNo = 1, pageSize = 10, sortBy = "idProduct", sortDirection = "ASC" } = {}) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_CATEGORY(categoryId), { params });
    return unwrap(resp);
  },

  getProductsByBrand: async (brand, { pageNo = 1, pageSize = 10, sortBy = "idProduct", sortDirection = "ASC" } = {}) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_BRAND(brand), { params });
    return unwrap(resp);
  },

  getProductsBySupplier: async (supplierId, { pageNo = 1, pageSize = 10, sortBy = "idProduct", sortDirection = "ASC" } = {}) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_SUPPLIER(supplierId), { params });
    return unwrap(resp);
  },

  getProductsByPriceRange: async (minPrice, maxPrice, { pageNo = 1, pageSize = 10, sortBy = "price", sortDirection = "ASC" } = {}) => {
    const params = { minPrice, maxPrice, pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_PRICE, { params });
    return unwrap(resp);
  },

  getBestSellers: async ({ status, pageNo = 1, pageSize = 10 } = {}) => {
    const params = { pageNo, pageSize };
    if (status) params.status = status;
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BEST_SELLERS, { params });
    return unwrap(resp);
  },

  createProduct: async (product) => {
    // ProductDto fields align với BE
    const body = {
      idCategory: product.idCategory,
      productName: product.productName,
      brand: product.brand || null,
      idSupplier: product.idSupplier || null,
      description: product.description || null,
      price: product.price,
      stockQuantity: product.stockQuantity != null ? product.stockQuantity : 0,
      status: product.status || null, // BE sẽ sync theo tồn nếu null
      imageUrl: product.imageUrl || null,
      productCode: product.productCode || null, // Với SKU có thể bỏ trống để BE tự sinh
      codeType: product.codeType, // IMEI | SERIAL | SKU | BARCODE
      sku: product.sku || null, // optional
    };
    const resp = await api.post(API_ENDPOINTS.PRODUCTS.BASE, body);
    return unwrap(resp);
  },

  updateProduct: async (id, product) => {
    const body = {
      idCategory: product.idCategory,
      productName: product.productName,
      brand: product.brand || null,
      idSupplier: product.idSupplier || null,
      description: product.description || null,
      price: product.price,
      stockQuantity: product.stockQuantity,
      status: product.status || null,
      imageUrl: product.imageUrl || null,
      productCode: product.productCode || null,
      codeType: product.codeType || null,
      sku: product.sku || null,
    };
    const resp = await api.put(API_ENDPOINTS.PRODUCTS.BY_ID(id), body);
    return unwrap(resp);
  },

  deleteProduct: async (id) => {
    const resp = await api.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return unwrap(resp);
  },
};
