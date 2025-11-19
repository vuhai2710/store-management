import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const authService = {
  /**
   * Register - Đăng ký tài khoản khách hàng mới
   * POST /api/v1/auth/register
   * @param {Object} registerData - Registration data
   * @param {string} registerData.username - Username (required, min 4 chars)
   * @param {string} registerData.password - Password (required, min 4 chars)
   * @param {string} registerData.email - Email (required, valid email)
   * @param {string} registerData.customerName - Customer name (required)
   * @param {string} registerData.phoneNumber - Phone number (required, valid phone)
   * @param {string} registerData.address - Address (optional)
   * @returns {Promise<{token: string, refreshToken: string, user: object}>}
   */
  register: async (registerData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, registerData);
      const data = unwrap(response);
      
      // Backend returns { token, refreshToken, user }
      if (data?.token) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        // Note: Customer info will be fetched by AuthContext after register
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login - Đăng nhập
   * POST /api/v1/auth/login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @param {boolean} rememberMe - Remember me flag (optional)
   * @returns {Promise<{token: string, refreshToken: string, user: object}>}
   */
  login: async (credentials, rememberMe = false) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const data = unwrap(response);
      
      // Backend returns { token, refreshToken, user }
      if (data?.token) {
        // Use localStorage if rememberMe is true, otherwise use sessionStorage
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        if (data.refreshToken) {
          storage.setItem('refreshToken', data.refreshToken);
        }
        // Also store rememberMe flag to know which storage was used
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
          // Clear localStorage token if switching from rememberMe to sessionStorage
          if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }
        // Note: Customer info will be fetched by AuthContext after login
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout - Đăng xuất
   * POST /api/v1/auth/logout
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Still clear local data even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data from both storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('customer');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('customer');
    }
  },

  /**
   * Forgot password - Quên mật khẩu
   * POST /api/v1/auth/forgot-password
   * @param {string} email - Email address
   * @returns {Promise<{message: string}>}
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user from localStorage
   * @returns {Object|null}
   */
  getUserFromStorage: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get customer from localStorage
   * @returns {Object|null}
   */
  getCustomerFromStorage: () => {
    const customerStr = localStorage.getItem('customer');
    return customerStr ? JSON.parse(customerStr) : null;
  },

  /**
   * Get token from storage (localStorage or sessionStorage)
   * @returns {string|null}
   */
  getToken: () => {
    // Check if rememberMe was set
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (rememberMe) {
      return localStorage.getItem('token');
    } else {
      return sessionStorage.getItem('token') || localStorage.getItem('token');
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

