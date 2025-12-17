import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const cartService = {

  getCart: async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.CART.BASE);
      return unwrap(resp);
    } catch (error) {

      if (error?.status === 400) {
        console.warn('Cart creation failed (possibly read-only database), returning empty cart');
        return { cartItems: [], totalAmount: 0, totalItems: 0 };
      }

      if (error?.status === 404) {
        console.warn('Cart not found, returning empty cart');
        return { cartItems: [], totalAmount: 0, totalItems: 0 };
      }
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  addToCart: async ({ productId, quantity }) => {
    const resp = await api.post(API_ENDPOINTS.CART.ITEMS, {
      productId,
      quantity,
    });
    return unwrap(resp);
  },

  updateCartItem: async (itemId, { quantity }) => {
    const resp = await api.put(API_ENDPOINTS.CART.ITEM_BY_ID(itemId), {
      quantity,
    });
    return unwrap(resp);
  },

  removeCartItem: async (itemId) => {
    const resp = await api.delete(API_ENDPOINTS.CART.ITEM_BY_ID(itemId));
    return unwrap(resp);
  },

  clearCart: async () => {
    const resp = await api.delete(API_ENDPOINTS.CART.BASE);
    return unwrap(resp);
  },
};
