import api from "./api";

export const productsService = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await api.get("/products", { params });

    // Endpoint này chưa có phân trang, xử lý response bình thường
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Upload product images
  uploadImages: async (productId, images) => {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    const response = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete product image
  deleteImage: async (productId, imageId) => {
    const response = await api.delete(
      `/products/${productId}/images/${imageId}`
    );
    return response.data;
  },

  // Get product categories
  getCategories: async () => {
    const response = await api.get("/products/categories");
    return response.data;
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    const response = await api.get("/products/low-stock", {
      params: { threshold },
    });
    return response.data;
  },

  // Update product stock
  updateStock: async (id, stockData) => {
    const response = await api.patch(`/products/${id}/stock`, stockData);
    return response.data;
  },
};
