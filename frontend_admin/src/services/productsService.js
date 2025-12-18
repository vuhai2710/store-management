import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const productsService = {
  getProductsPaginated: async ({
    pageNo = 1,
    pageSize = 10,
    sortBy = "idProduct",
    sortDirection = "ASC",
    keyword,
    categoryId,
    brand,
    minPrice,
    maxPrice,
    inventoryStatus,
  } = {}) => {
    const params = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    if (categoryId) params.categoryId = categoryId;
    if (brand) params.brand = brand;
    if (minPrice != null) params.minPrice = minPrice;
    if (maxPrice != null) params.maxPrice = maxPrice;
    if (inventoryStatus) params.inventoryStatus = inventoryStatus;

    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BASE, { params });
    return unwrap(resp);
  },

  getProductById: async (id) => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return unwrap(resp);
  },



  getProductsByCategory: async (
    categoryId,
    {
      pageNo = 1,
      pageSize = 10,
      sortBy = "idProduct",
      sortDirection = "ASC",
    } = {}
  ) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_CATEGORY(categoryId), {
      params,
    });
    return unwrap(resp);
  },



  getProductsBySupplier: async (
    supplierId,
    {
      pageNo = 1,
      pageSize = 10,
      sortBy = "idProduct",
      sortDirection = "ASC",
    } = {}
  ) => {
    const params = { pageNo, pageSize, sortBy, sortDirection };
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BY_SUPPLIER(supplierId), {
      params,
    });
    return unwrap(resp);
  },





  getTop5BestSellingProducts: async ({ status } = {}) => {
    const params = {};
    if (status) params.status = status;
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.TOP_5_BEST_SELLERS, {
      params,
    });
    return unwrap(resp);
  },

  createProduct: async (product) => {

    const body = {
      idCategory: product.idCategory,
      productName: product.productName,
      brand: product.brand || null,
      idSupplier: product.idSupplier || null,
      description: product.description || null,
      price: product.price,
      stockQuantity: product.stockQuantity != null ? product.stockQuantity : 0,
      status: product.status || null,
      imageUrl: product.imageUrl || null,
      productCode: product.productCode || null,
      codeType: product.codeType,
      sku: product.sku || null,
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

  uploadProductImages: async (productId, images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });
    const resp = await api.post(
      API_ENDPOINTS.PRODUCTS.BY_ID(productId) + "/images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return unwrap(resp);
  },

  getProductImages: async (productId) => {
    const resp = await api.get(
      API_ENDPOINTS.PRODUCTS.BY_ID(productId) + "/images"
    );
    return unwrap(resp);
  },

  deleteProductImage: async (imageId) => {
    const resp = await api.delete(`/products/images/${imageId}`);
    return unwrap(resp);
  },

  setImageAsPrimary: async (imageId) => {
    const resp = await api.put(`/products/images/${imageId}/primary`);
    return unwrap(resp);
  },

  getAllBrands: async () => {
    const resp = await api.get(API_ENDPOINTS.PRODUCTS.BRANDS);
    return unwrap(resp);
  },
};
