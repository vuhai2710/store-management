/**
 * API Endpoints Constants for Customer Frontend
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // Categories
  CATEGORIES: {
    GET_ALL: "/categories/all",
    BY_ID: (id) => `/categories/${id}`,
  },

  // Products
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id) => `/products/${id}`,
    SEARCH_BY_NAME: "/products/search/name",
    BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,
    BY_BRAND: (brand) => `/products/brand/${encodeURIComponent(brand)}`,
    BY_PRICE: "/products/price",
    BEST_SELLERS: "/products/best-sellers",
    TOP_5_BEST_SELLERS: "/products/best-sellers/top-5",
    NEW_PRODUCTS: "/products/new",
    RELATED: (id) => `/products/${id}/related`,
    BRANDS: "/products/brands",
    IMAGES: (id) => `/products/${id}/images`,
    RECOMMEND: "/products/recommend",
    SIMILAR: (id) => `/products/${id}/similar`,
    ON_SALE: "/products/on-sale",
  },

  // Cart
  CART: {
    BASE: "/cart",
    ITEMS: "/cart/items",
    ITEM_BY_ID: (itemId) => `/cart/items/${itemId}`,
  },

  // Orders
  ORDERS: {
    BASE: "/orders",
    BY_ID: (id) => `/orders/${id}`,
    CHECKOUT: "/orders/checkout",
    BUY_NOW: "/orders/buy-now",
    MY_ORDERS: "/orders/my-orders",
    MY_ORDER_BY_ID: (orderId) => `/orders/my-orders/${orderId}`,
    CANCEL: (orderId) => `/orders/my-orders/${orderId}/cancel`,
    CONFIRM_DELIVERY: (orderId) =>
      `/orders/my-orders/${orderId}/confirm-delivery`,
  },

  // Shipping Addresses
  SHIPPING_ADDRESSES: {
    BASE: "/shipping-addresses",
    DEFAULT: "/shipping-addresses/default",
    BY_ID: (id) => `/shipping-addresses/${id}`,
    SET_DEFAULT: (id) => `/shipping-addresses/${id}/set-default`,
  },

  // Customer
  CUSTOMERS: {
    ME: "/customers/me",
    ME_CHANGE_PASSWORD: "/customers/me/change-password",
  },

  // GHN (Giao Hàng Nhanh)
  GHN: {
    PROVINCES: "/ghn/provinces",
    DISTRICTS: "/ghn/districts",
    WARDS: "/ghn/wards",
    CALCULATE_FEE: "/ghn/calculate-fee",
    SERVICES: "/ghn/services",
  },

  // PayOS Payment
  PAYMENTS: {
    PAYOS: {
      CREATE: (orderId) => `/payments/payos/create/${orderId}`,
      STATUS: (orderId) => `/payments/payos/status/${orderId}`,
    },
  },

  // User
  USERS: {
    AVATAR: "/users/avatar",
    PROFILE: "/users/profile",
  },

  // Chat
  CHAT: {
    CONVERSATIONS: "/chat/conversations",
    MY_CONVERSATION: "/chat/conversations/my",
    CONVERSATION_MESSAGES: (id) => `/chat/conversations/${id}/messages`,
    CLOSE_CONVERSATION: (id) => `/chat/conversations/${id}/close`,
    MARK_VIEWED: (id) => `/chat/conversations/${id}/mark-viewed`,
  },

  // Promotions
  PROMOTIONS: {
    VALIDATE: "/promotions/validate",
    CALCULATE: "/promotions/calculate",
    CALCULATE_AUTO_SHIPPING: "/promotions/calculate-auto-shipping",
  },

  // Reviews
  REVIEWS: {
    CREATE: (productId) => `/products/${productId}/reviews`,
    GET_PRODUCT_REVIEWS: (productId) => `/products/${productId}/reviews`,
    GET_MY_REVIEWS: "/reviews/my-reviews",
    UPDATE: (reviewId) => `/reviews/${reviewId}`,
    DELETE: (reviewId) => `/reviews/${reviewId}`,
  },
};
