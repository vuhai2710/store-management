/**
 * Constants - API Endpoints
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
  },

  // Users
  USERS: {
    BASE: "/users",
    STATUS: "/users/status",
    BY_ID: (id) => `/users/${id}`,
    ACTIVATE: (id) => `/users/${id}/activate`,
    DEACTIVATE: (id) => `/users/${id}/deactivate`,
    CHANGE_ROLE: (id) => `/users/${id}/role`,
    PROFILE: "/users/profile",
  },

  // Customers
  CUSTOMERS: {
    BASE: "/customers",
    BY_ID: (id) => `/customers/${id}`,
    SEARCH: "/customers/search",
    BY_TYPE: (type) => `/customers/type/${type}`,
    UPGRADE_VIP: (id) => `/customers/${id}/upgrade-vip`,
    DOWNGRADE_REGULAR: (id) => `/customers/${id}/downgrade-regular`,
    ME: "/customers/me",
  },

  // Products
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id) => `/products/${id}`,
    CATEGORIES: "/products/categories",
    LOW_STOCK: "/products/low-stock",
    STOCK: (id) => `/products/${id}/stock`,
    IMAGES: (id) => `/products/${id}/images`,
    DELETE_IMAGE: (productId, imageId) =>
      `/products/${productId}/images/${imageId}`,
  },

  // Orders
  ORDERS: {
    BASE: "/orders",
    BY_ID: (id) => `/orders/${id}`,
    STATUS: (id) => `/orders/${id}/status`,
    STATS: "/orders/stats",
    EXPORT: "/orders/export",
    INVOICE: (id) => `/orders/${id}/invoice`,
  },

  // Inventory
  INVENTORY: {
    BASE: "/inventory",
    MOVEMENTS: "/inventory/movements",
  },

  // Suppliers
  SUPPLIERS: {
    BASE: "/suppliers",
    BY_ID: (id) => `/suppliers/${id}`,
  },

  // Warehouses
  WAREHOUSES: {
    BASE: "/warehouses",
    BY_ID: (id) => `/warehouses/${id}`,
  },

  // Employees
  EMPLOYEES: {
    BASE: "/employees",
    BY_ID: (id) => `/employees/${id}`,
    DEPARTMENTS: "/employees/departments",
    POSITIONS: "/employees/positions",
    ROLE: (id) => `/employees/${id}/role`,
    ACTIVITIES: (id) => `/employees/${id}/activities`,
  },

  // Finance
  FINANCE: {
    BASE: "/finance",
    PAYROLL: "/finance/payroll",
    PAYROLL_BY_ID: (id) => `/finance/payroll/${id}`,
    TRANSACTIONS: "/finance/transactions",
    REPORTS: {
      REVENUE: "/finance/reports/revenue",
      EXPENSES: "/finance/reports/expenses",
      PROFIT: "/finance/reports/profit",
      EXPORT: "/finance/reports/export",
    },
  },
};


