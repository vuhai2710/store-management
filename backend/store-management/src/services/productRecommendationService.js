import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để thêm token vào mọi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Lấy sản phẩm gợi ý cho trang chủ
 * @param {number} limit - Số lượng sản phẩm cần lấy (mặc định: 10)
 * @returns {Promise<Array>} Danh sách sản phẩm gợi ý
 */
export const getHomePageRecommendations = async (limit = 10) => {
  try {
    console.log('Calling API: /products/recommendations/home?limit=' + limit);
    console.log('API Base URL:', API_BASE_URL);
    
    const response = await apiClient.get(
      `/products/recommendations/home?limit=${limit}`
    );
    
    console.log('API Response:', response.data);
    
    if (response.data && response.data.code === 200) {
      const data = response.data.data || [];
      console.log('Recommendations data:', data);
      return data;
    }
    
    console.warn('Unexpected response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching home page recommendations:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    // Nếu lỗi 401, có thể user chưa đăng nhập
    if (error.response?.status === 401) {
      console.warn('User not authenticated. Recommendations may be limited.');
      throw new Error('Vui lòng đăng nhập để xem sản phẩm gợi ý');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền truy cập');
    }
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.');
    }
    
    throw error;
  }
};

/**
 * Lấy sản phẩm tương tự cho một sản phẩm cụ thể
 * @param {number} productId - ID sản phẩm
 * @param {number} topN - Số lượng sản phẩm tương tự (mặc định: 5)
 * @returns {Promise<Array>} Danh sách sản phẩm tương tự
 */
export const getRecommendedProducts = async (productId, topN = 5) => {
  try {
    const response = await apiClient.get(
      `/products/recommendations/${productId}?topN=${topN}`
    );
    
    if (response.data && response.data.code === 200) {
      return response.data.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return [];
  }
};

export default {
  getHomePageRecommendations,
  getRecommendedProducts
};

