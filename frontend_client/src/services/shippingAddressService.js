import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const shippingAddressService = {
  /**
   * Get all shipping addresses
   * GET /api/v1/shipping-addresses
   * @returns {Promise<ShippingAddressDTO[]>}
   */
  getAllAddresses: async () => {
    const resp = await api.get(API_ENDPOINTS.SHIPPING_ADDRESSES.BASE);
    return unwrap(resp);
  },

  /**
   * Get default shipping address
   * GET /api/v1/shipping-addresses/default
   * @returns {Promise<ShippingAddressDTO>}
   */
  getDefaultAddress: async () => {
    const resp = await api.get(API_ENDPOINTS.SHIPPING_ADDRESSES.DEFAULT);
    return unwrap(resp);
  },

  /**
   * Create shipping address
   * POST /api/v1/shipping-addresses
   * @param {Object} addressData - Address data
   * @param {string} addressData.recipientName - Recipient name
   * @param {string} addressData.phoneNumber - Phone number
   * @param {string} addressData.address - Address
   * @param {number} addressData.provinceId - Province ID (GHN)
   * @param {number} addressData.districtId - District ID (GHN)
   * @param {number} addressData.wardId - Ward ID (GHN)
   * @param {boolean} addressData.isDefault - Is default address
   * @returns {Promise<ShippingAddressDTO>}
   */
  createAddress: async (addressData) => {
    const resp = await api.post(API_ENDPOINTS.SHIPPING_ADDRESSES.BASE, addressData);
    return unwrap(resp);
  },

  /**
   * Update shipping address
   * PUT /api/v1/shipping-addresses/{addressId}
   * @param {number} addressId - Address ID
   * @param {Object} addressData - Address data
   * @returns {Promise<ShippingAddressDTO>}
   */
  updateAddress: async (addressId, addressData) => {
    const resp = await api.put(API_ENDPOINTS.SHIPPING_ADDRESSES.BY_ID(addressId), addressData);
    return unwrap(resp);
  },

  /**
   * Set default shipping address
   * PUT /api/v1/shipping-addresses/{addressId}/set-default
   * @param {number} addressId - Address ID
   * @returns {Promise<ShippingAddressDTO>}
   */
  setDefaultAddress: async (addressId) => {
    const resp = await api.put(API_ENDPOINTS.SHIPPING_ADDRESSES.SET_DEFAULT(addressId));
    return unwrap(resp);
  },

  /**
   * Delete shipping address
   * DELETE /api/v1/shipping-addresses/{addressId}
   * @param {number} addressId - Address ID
   * @returns {Promise<void>}
   */
  deleteAddress: async (addressId) => {
    const resp = await api.delete(API_ENDPOINTS.SHIPPING_ADDRESSES.BY_ID(addressId));
    return unwrap(resp);
  },
};






