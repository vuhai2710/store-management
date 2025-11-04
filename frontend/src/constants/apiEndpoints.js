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
    CODE: (code) => `/products/code/${encodeURIComponent(code)}`,
    SEARCH_BY_NAME: "/products/search/name",
    BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,
    BY_BRAND: (brand) => `/products/brand/${encodeURIComponent(brand)}`,
    BY_SUPPLIER: (supplierId) => `/products/supplier/${supplierId}`,
    BY_PRICE: "/products/price",
    BEST_SELLERS: "/products/best-sellers",
    // PUBLIC: "/products/public" // nếu có dùng listing public
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
    GET_ALL: "/suppliers/all",
    SEARCH: "/suppliers/search",
    CREATE: "/suppliers",
    UPDATE: (id) => `/suppliers/${id}`,
    DELETE: (id) => `/suppliers/${id}`,
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

  // Categories
  CATEGORIES: {
    BASE: "/categories",
    GET_ALL: "/categories/all",
    BY_ID: (id) => `/categories/${id}`,
    // SEARCH: "/categories/search", // nếu backend có
  },
};


