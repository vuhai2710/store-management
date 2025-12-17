import api from "./api";

const unwrap = (resp) => resp?.data?.data ?? resp?.data;

export const inventoryTransactionService = {

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
    return unwrap(response);
  },

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
