import axios from 'axios';

// Spring Boot API URL - thay đổi port thành 8080 (hoặc port của Spring Boot)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cho phép gửi cookies và credentials
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle Spring Boot ApiResponse format
api.interceptors.response.use(
  (response) => {
    // Spring Boot trả về format: { code, message, data }
    // Trả về data để dễ sử dụng
    if (response.data && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data,
        message: response.data.message,
        code: response.data.code,
      };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Xử lý error message từ Spring Boot
    const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
    const errorData = error.response?.data?.errors || null;
    
    return Promise.reject({
      message: errorMessage,
      errors: errorData,
      status: error.response?.status,
      originalError: error,
    });
  }
);

export default api;


