import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const authService = {

  register: async (registerData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, registerData);
      const data = unwrap(response);

      if (data?.token) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials, rememberMe = false) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const data = unwrap(response);

      if (data?.token) {

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        if (data.refreshToken) {
          storage.setItem('refreshToken', data.refreshToken);
        }

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');

          if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }

      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {

      console.error('Logout error:', error);
    } finally {

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

  forgotPassword: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
        confirmPassword,
      });
      return unwrap(response);
    } catch (error) {
      throw error;
    }
  },

  getUserFromStorage: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getCustomerFromStorage: () => {
    const customerStr = localStorage.getItem('customer');
    return customerStr ? JSON.parse(customerStr) : null;
  },

  getToken: () => {

    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (rememberMe) {
      return localStorage.getItem('token');
    } else {
      return sessionStorage.getItem('token') || localStorage.getItem('token');
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
