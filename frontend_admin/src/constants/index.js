/**
 * Constants - Export all constants
 */

export * from "./apiEndpoints";
export * from "./roles";
export * from "./customerTypes";
export * from "./orderStatus";

// App Configuration
export const APP_CONFIG = {
  APP_NAME: "Store Management System",
  APP_VERSION: "1.0.0",
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ["10", "20", "50", "100"],
  DATE_FORMAT: "DD/MM/YYYY",
  DATETIME_FORMAT: "DD/MM/YYYY HH:mm:ss",
  CURRENCY: "VND",
};

// Validation Rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 50,
  },
  PHONE: {
    PATTERN: /^[0-9]{10,11}$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Low Stock Threshold
export const LOW_STOCK_THRESHOLD = 10;
