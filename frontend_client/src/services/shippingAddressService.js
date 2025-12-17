import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const shippingAddressService = {

  getAllAddresses: async () => {
    const resp = await api.get(API_ENDPOINTS.SHIPPING_ADDRESSES.BASE);
    return unwrap(resp);
  },

  getDefaultAddress: async () => {
    const resp = await api.get(API_ENDPOINTS.SHIPPING_ADDRESSES.DEFAULT);
    return unwrap(resp);
  },

  createAddress: async (addressData) => {
    const resp = await api.post(API_ENDPOINTS.SHIPPING_ADDRESSES.BASE, addressData);
    return unwrap(resp);
  },

  updateAddress: async (addressId, addressData) => {
    const resp = await api.put(API_ENDPOINTS.SHIPPING_ADDRESSES.BY_ID(addressId), addressData);
    return unwrap(resp);
  },

  setDefaultAddress: async (addressId) => {
    const resp = await api.put(API_ENDPOINTS.SHIPPING_ADDRESSES.SET_DEFAULT(addressId));
    return unwrap(resp);
  },

  deleteAddress: async (addressId) => {
    const resp = await api.delete(API_ENDPOINTS.SHIPPING_ADDRESSES.BY_ID(addressId));
    return unwrap(resp);
  },
};
