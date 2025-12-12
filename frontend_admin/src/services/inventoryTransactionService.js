import api from "./api";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

/**
 * Inventory Transaction Service
 * Handles all inventory transaction-related API calls
 * Backend API: /api/v1/inventory-transactions
 */
export const inventoryTransactionService = {
  /**
   * Get all inventory transactions with pagination
   * GET /api/v1/inventory-transactions
   * @param {Object} params - Query parameters
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "transactionDate")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "DESC")
   * @returns {Promise<PageResponse<InventoryTransactionDTO>>}
   */
  getAllTransactions: async (params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "transactionDate",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    const response = await api.get("/inventory-transactions", {
      params: queryParams,
    });
    return unwrap(response); // Returns PageResponse<InventoryTransactionDTO>
  },

  /**
   * Get transactions by product ID
   * GET /api/v1/inventory-transactions/product/{productId}
   * @param {number} productId - Product ID
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<InventoryTransactionDTO>>}
   */
  getTransactionsByProduct: async (productId, params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "transactionDate",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    const response = await api.get(
      `/inventory-transactions/product/${productId}`,
      {
        params: queryParams,
      }
    );
    return unwrap(response);
  },

  /**
   * Filter transactions by multiple criteria
   * GET /api/v1/inventory-transactions/filter
   * @param {Object} params - Filter parameters
   * @param {string} params.transactionType - Transaction type (IN or OUT)
   * @param {number} params.productId - Product ID
   * @param {string} params.startDate - Start date (ISO format)
   * @param {string} params.endDate - End date (ISO format)
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "transactionDate")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "DESC")
   * @returns {Promise<PageResponse<InventoryTransactionDTO>>}
   */
  filterTransactions: async (params = {}) => {
    const {
      transactionType,
      productId,
      startDate,
      endDate,
      pageNo = 1,
      pageSize = 10,
      sortBy = "transactionDate",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (transactionType) queryParams.transactionType = transactionType;
    if (productId) queryParams.productId = productId;
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;

    const response = await api.get("/inventory-transactions/filter", {
      params: queryParams,
    });
    return unwrap(response);
  },

  /**
   * Advanced filter transactions with referenceType, productName, sku support
   * GET /api/v1/inventory-transactions/filter-advanced
   * @param {Object} params - Filter parameters
   * @param {string} params.transactionType - Transaction type (IN or OUT)
   * @param {string} params.referenceType - Reference type (PURCHASE_ORDER, SALE_ORDER, ADJUSTMENT, SALE_RETURN, SALE_EXCHANGE)
   * @param {number} params.productId - Product ID
   * @param {string} params.productName - Product name (partial match)
   * @param {string} params.sku - SKU code (partial match)
   * @param {string} params.startDate - Start date (ISO format without timezone, e.g., "2024-01-01T00:00:00")
   * @param {string} params.endDate - End date (ISO format without timezone, e.g., "2024-12-31T23:59:59")
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "transactionDate")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "DESC")
   * @returns {Promise<PageResponse<InventoryTransactionDTO>>}
   */
  filterTransactionsAdvanced: async (params = {}) => {
    const {
      transactionType,
      referenceType,
      productId,
      productName,
      sku,
      startDate,
      endDate,
      pageNo = 1,
      pageSize = 10,
      sortBy = "transactionDate",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (transactionType) queryParams.transactionType = transactionType;
    if (referenceType) queryParams.referenceType = referenceType;
    if (productId) queryParams.productId = productId;
    if (productName) queryParams.productName = productName;
    if (sku) queryParams.sku = sku;
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;

    const response = await api.get("/inventory-transactions/filter-advanced", {
      params: queryParams,
    });
    return unwrap(response);
  },

  /**
   * Get transactions by reference type and ID
   * GET /api/v1/inventory-transactions/reference
   * @param {string} referenceType - Reference type (e.g., PURCHASE_ORDER, SALE_ORDER)
   * @param {number} referenceId - Reference ID
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<InventoryTransactionDTO>>}
   */
  getTransactionsByReference: async (
    referenceType,
    referenceId,
    params = {}
  ) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "transactionDate",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      referenceType,
      referenceId,
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    const response = await api.get("/inventory-transactions/reference", {
      params: queryParams,
    });
    return unwrap(response);
  },

  /**
   * Get transactions by type (IN or OUT)
   * GET /api/v1/inventory-transactions/by-type
   * @param {string} transactionType - Transaction type (IN or OUT)
   * @param {Object} params - Query parameters
   * @returns {Promise<PageResponse<InventoryTransactionDTO>>}
   */
  getTransactionsByType: async (transactionType, params = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      sortBy = "transactionDate",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      transactionType,
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    const response = await api.get("/inventory-transactions/by-type", {
      params: queryParams,
    });
    return unwrap(response);
  },

  /**
   * Get transaction history by date range
   * GET /api/v1/inventory-transactions/history
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date (ISO format)
   * @param {string} params.endDate - End date (ISO format)
   * @param {number} params.productId - Product ID (optional)
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @returns {Promise<PageResponse<InventoryTransactionDTO>>}
   */
  getTransactionHistory: async (params = {}) => {
    const {
      startDate,
      endDate,
      productId,
      pageNo = 1,
      pageSize = 10,
      sortBy = "transactionDate",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;
    if (productId) queryParams.productId = productId;

    const response = await api.get("/inventory-transactions/history", {
      params: queryParams,
    });
    return unwrap(response);
  },

  /**
   * Unified search/filter transactions using Specification pattern
   * GET /api/v1/inventory-transactions/search
   * Supports all filter combinations including referenceId for filtering by specific order
   *
   * @param {Object} params - Filter parameters
   * @param {string} params.transactionType - Transaction type (IN or OUT) - optional
   * @param {string} params.referenceType - Reference type (PURCHASE_ORDER, SALE_ORDER, ADJUSTMENT, SALE_RETURN, SALE_EXCHANGE) - optional
   * @param {number} params.referenceId - Specific reference ID (e.g., orderId) - optional
   * @param {number} params.productId - Product ID - optional
   * @param {string} params.productName - Product name (partial match) - optional
   * @param {string} params.sku - SKU code (partial match) - optional
   * @param {string} params.fromDate - Start date (ISO format without timezone, e.g., "2024-01-01T00:00:00") - optional
   * @param {string} params.toDate - End date (ISO format without timezone, e.g., "2024-12-31T23:59:59") - optional
   * @param {number} params.pageNo - Page number (default: 1)
   * @param {number} params.pageSize - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: "transactionDate")
   * @param {string} params.sortDirection - Sort direction ASC/DESC (default: "DESC")
   * @returns {Promise<PageResponse<InventoryTransactionDTO>>}
   */
  searchTransactions: async (params = {}) => {
    const {
      transactionType,
      referenceType,
      referenceId,
      productId,
      productName,
      sku,
      brand,
      fromDate,
      toDate,
      pageNo = 1,
      pageSize = 10,
      sortBy = "transactionDate",
      sortDirection = "DESC",
    } = params;

    const queryParams = {
      pageNo,
      pageSize,
      sortBy,
      sortDirection,
    };

    if (transactionType) queryParams.transactionType = transactionType;
    if (referenceType) queryParams.referenceType = referenceType;
    if (referenceId) queryParams.referenceId = referenceId;
    if (productId) queryParams.productId = productId;
    if (productName) queryParams.productName = productName;
    if (sku) queryParams.sku = sku;
    if (brand) queryParams.brand = brand;
    if (fromDate) queryParams.fromDate = fromDate;
    if (toDate) queryParams.toDate = toDate;

    const response = await api.get("/inventory-transactions/search", {
      params: queryParams,
    });
    return unwrap(response);
  },
};
