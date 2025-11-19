import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const unwrap = (resp) => resp?.data ?? resp;

export const cartService = {
  /**
   * Get cart
   * GET /api/v1/cart
   * @returns {Promise<CartDTO>}
   */
  getCart: async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.CART.BASE);
      return unwrap(resp);
    } catch (error) {
      // If 400 (read-only database or cart creation failed), return empty cart
      if (error?.status === 400) {
        console.warn('Cart creation failed (possibly read-only database), returning empty cart');
        return { cartItems: [], totalAmount: 0, totalItems: 0 };
      }
      // If 404 (cart not found), return empty cart
      if (error?.status === 404) {
        console.warn('Cart not found, returning empty cart');
        return { cartItems: [], totalAmount: 0, totalItems: 0 };
      }
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  /**
   * Add item to cart
   * POST /api/v1/cart/items
   * @param {Object} item - Cart item data
   * @param {number} item.productId - Product ID
   * @param {number} item.quantity - Quantity
   * @returns {Promise<CartDTO>}
   */
  addToCart: async ({ productId, quantity }) => {
    const resp = await api.post(API_ENDPOINTS.CART.ITEMS, {
      productId,
      quantity,
    });
    return unwrap(resp);
  },

  /**
   * Update cart item
   * PUT /api/v1/cart/items/{itemId}
   * @param {number} itemId - Cart item ID
   * @param {Object} item - Cart item data
   * @param {number} item.quantity - New quantity
   * @returns {Promise<CartDTO>}
   */
  updateCartItem: async (itemId, { quantity }) => {
    const resp = await api.put(API_ENDPOINTS.CART.ITEM_BY_ID(itemId), {
      quantity,
    });
    return unwrap(resp);
  },

  /**
   * Remove cart item
   * DELETE /api/v1/cart/items/{itemId}
   * @param {number} itemId - Cart item ID
   * @returns {Promise<CartDTO>}
   */
  removeCartItem: async (itemId) => {
    const resp = await api.delete(API_ENDPOINTS.CART.ITEM_BY_ID(itemId));
    return unwrap(resp);
  },

  /**
   * Clear cart
   * DELETE /api/v1/cart
   * @returns {Promise<void>}
   */
  clearCart: async () => {
    const resp = await api.delete(API_ENDPOINTS.CART.BASE);
    return unwrap(resp);
  },
};


