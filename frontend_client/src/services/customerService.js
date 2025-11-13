import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const customerService = {
  /**
   * Get my customer profile
   * GET /api/v1/customers/me
   * @returns {Promise<CustomerDTO>}
   */
  getMyProfile: async () => {
    const resp = await api.get(API_ENDPOINTS.CUSTOMERS.ME);
    return unwrap(resp);
  },

  /**
   * Update my customer profile
   * PUT /api/v1/customers/me
   * @param {Object} profileData - Profile data
   * @returns {Promise<CustomerDTO>}
   */
  updateMyProfile: async (profileData) => {
    const resp = await api.put(API_ENDPOINTS.CUSTOMERS.ME, profileData);
    const updatedCustomer = unwrap(resp);
    // Update localStorage
    if (updatedCustomer) {
      localStorage.setItem('customer', JSON.stringify(updatedCustomer));
      localStorage.setItem('user', JSON.stringify(updatedCustomer));
    }
    return updatedCustomer;
  },

  /**
   * Change password
   * PUT /api/v1/customers/me/change-password
   * @param {Object} passwordData - Password data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<void>}
   */
  changePassword: async ({ currentPassword, newPassword }) => {
    const resp = await api.put(API_ENDPOINTS.CUSTOMERS.ME_CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return unwrap(resp);
  },
};





