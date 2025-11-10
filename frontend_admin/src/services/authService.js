import api from './api';

export const authService = {
  // Register - Đăng ký tài khoản mới
  register: async (registerData) => {
    try {
      const response = await api.post('/auth/register', registerData);
      // Lưu token và user info vào localStorage
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.userInfo));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login - Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Lưu token và user info vào localStorage
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.userInfo));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout - Đăng xuất
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      // Xóa token và user info khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      // Vẫn xóa local data ngay cả khi API call thất bại
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Get current user - Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user from localStorage
  getUserFromStorage: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};


