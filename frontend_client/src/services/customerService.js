import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const customerService = {

  getMyProfile: async () => {
    const resp = await api.get(API_ENDPOINTS.CUSTOMERS.ME);
    return unwrap(resp);
  },

  updateMyProfile: async (profileData) => {
    const resp = await api.put(API_ENDPOINTS.CUSTOMERS.ME, profileData);
    const updatedCustomer = unwrap(resp);

    if (updatedCustomer) {
      localStorage.setItem('customer', JSON.stringify(updatedCustomer));
      localStorage.setItem('user', JSON.stringify(updatedCustomer));
    }
    return updatedCustomer;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const resp = await api.put(API_ENDPOINTS.CUSTOMERS.ME_CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return unwrap(resp);
  },
};
