import api from "./api";

const parseBackendDate = (dateString) => {
  if (!dateString) return new Date().toISOString();

  if (dateString.includes("T") || dateString.includes("-")) {
    return dateString;
  }

  const parts = dateString.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;

    return new Date(`${year}-${month}-${day}`).toISOString();
  }

  return new Date().toISOString();
};

const transformCustomer = (customer) => ({
  id: customer.idCustomer,
  idCustomer: customer.idCustomer,
  userId: customer.idUser,
  idUser: customer.idUser,
  name: customer.customerName,
  customerName: customer.customerName,
  fullName: customer.customerName,
  email: customer.email,
  phone: customer.phoneNumber,
  phoneNumber: customer.phoneNumber,
  address: customer.address,
  username: customer.username,
  customerType: customer.customerType || "REGULAR",
  status: "active",
  isActive: customer.isActive,
  avatar: null,
  avatarUrl: customer.avatarUrl,
  createdAt: parseBackendDate(customer.createdAt),
  updatedAt: parseBackendDate(customer.updatedAt),
});

const handlePageResponse = (pageResponse) => {

  if (!pageResponse) {
    return {
      data: [],
      total: 0,
      pageNo: 1,
      pageSize: 5,
      totalPages: 0,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
      isEmpty: true,
    };
  }

  const transformedData = Array.isArray(pageResponse.content)
    ? pageResponse.content.map(transformCustomer)
    : [];

  return {
    data: transformedData,
    total: pageResponse.totalElements || 0,
    pageNo: (pageResponse.pageNo || 0) + 1,
    pageSize: pageResponse.pageSize || 5,
    totalPages: pageResponse.totalPages || 0,
    isFirst: pageResponse.isFirst !== undefined ? pageResponse.isFirst : true,
    isLast: pageResponse.isLast !== undefined ? pageResponse.isLast : true,
    hasNext: pageResponse.hasNext !== undefined ? pageResponse.hasNext : false,
    hasPrevious:
      pageResponse.hasPrevious !== undefined ? pageResponse.hasPrevious : false,
    isEmpty: pageResponse.isEmpty !== undefined ? pageResponse.isEmpty : true,
  };
};

const handleSingleCustomerResponse = (customerDto) => {

  if (!customerDto) {
    throw new Error("Invalid response from server");
  }

  return transformCustomer(customerDto);
};
export const customersService = {

  getAllCustomers: async (params = {}) => {
    try {
      const requestParams = {
        pageNo: params.pageNo || params.page || 1,
        pageSize: params.pageSize || params.limit || 5,
        sortBy: params.sortBy || "idCustomer",
        sortDirection: params.sortDirection || "ASC",
      };

      if (params.keyword) {
        requestParams.keyword = params.keyword;
      }

      console.log("Calling getAllCustomers with params:", requestParams);
      const response = await api.get("/customers", { params: requestParams });
      console.log("API Response getAllCustomers:", response.data);
      return handlePageResponse(response.data);
    } catch (error) {
      console.error("Error getAllCustomers:", error);
      throw error;
    }
  },

  getCustomers: async (params = {}) => {

    return customersService.getAllCustomers(params);
  },

  getCustomerById: async (id) => {
    try {
      console.log("Calling getCustomerById with id:", id);
      const response = await api.get(`/customers/${id}`);
      console.log("API Response getCustomerById:", response.data);
      return handleSingleCustomerResponse(response.data);
    } catch (error) {
      console.error("Error getCustomerById:", error);
      throw error;
    }
  },

  searchCustomers: async (params = {}) => {
    try {
      const requestParams = {
        pageNo: params.pageNo || params.page || 1,
        pageSize: params.pageSize || params.limit || 5,
        sortBy: params.sortBy || "idCustomer",
        sortDirection: params.sortDirection || "ASC",
      };

      if (params.name) requestParams.name = params.name;
      if (params.phone) requestParams.phone = params.phone;

      console.log("Calling searchCustomers with params:", requestParams);
      const response = await api.get("/customers/search", {
        params: requestParams,
      });
      console.log("API Response searchCustomers:", response.data);
      return handlePageResponse(response.data);
    } catch (error) {
      console.error("Error searchCustomers:", error);
      throw error;
    }
  },

  getCustomersByType: async (type, params = {}) => {
    try {

      const typeUpperCase = type.toUpperCase();

      const requestParams = {
        pageNo: params.pageNo || params.page || 1,
        pageSize: params.pageSize || params.limit || 5,
        sortBy: params.sortBy || "idCustomer",
        sortDirection: params.sortDirection || "ASC",
      };

      console.log(
        "Calling getCustomersByType with type:",
        typeUpperCase,
        "params:",
        requestParams
      );
      const response = await api.get(`/customers/type/${typeUpperCase}`, {
        params: requestParams,
      });
      console.log("API Response getCustomersByType:", response.data);
      return handlePageResponse(response.data);
    } catch (error) {
      console.error("Error getCustomersByType:", error);
      throw error;
    }
  },

  updateCustomer: async (id, customerData) => {
    try {

      const requestData = {
        customerName: customerData.customerName || customerData.name,
        phoneNumber: customerData.phoneNumber || customerData.phone,
        address: customerData.address,
        customerType: customerData.customerType,
      };

      console.log("Calling updateCustomer with id:", id, "data:", requestData);
      const response = await api.put(`/customers/${id}`, requestData);
      console.log("API Response updateCustomer:", response.data);
      return handleSingleCustomerResponse(response.data);
    } catch (error) {
      console.error("Error updateCustomer:", error);
      console.error("Error details:", error.message, error.errors);
      throw error;
    }
  },

  createCustomer: async (customerData) => {
    try {
      const requestData = {
        username: customerData.username,
        password: customerData.password,
        email: customerData.email,
        customerName: customerData.customerName || customerData.name,
        phoneNumber: customerData.phoneNumber || customerData.phone,
        address: customerData.address || "",
      };

      console.log("Calling createCustomer (register) with data:", requestData);
      const response = await api.post("/auth/register", requestData);
      console.log("API Response createCustomer (register):", response.data);

      return {
        success: true,
        token: response.data.token,
        authenticated: response.data.authenticated,
      };
    } catch (error) {
      console.error("Error createCustomer (register):", error);
      throw error;
    }
  },

  registerCustomer: async (formData) => {
    return customersService.createCustomer(formData);
  },

  upgradeToVip: async (id) => {
    try {
      console.log("Calling upgradeToVip with id:", id);
      const response = await api.patch(`/customers/${id}/upgrade-vip`);
      console.log("API Response upgradeToVip:", response.data);
      return handleSingleCustomerResponse(response.data);
    } catch (error) {
      console.error("Error upgradeToVip:", error);
      throw error;
    }
  },

  downgradeToRegular: async (id) => {
    try {
      console.log("Calling downgradeToRegular with id:", id);
      const response = await api.patch(`/customers/${id}/downgrade-regular`);
      console.log("API Response downgradeToRegular:", response.data);
      return handleSingleCustomerResponse(response.data);
    } catch (error) {
      console.error("Error downgradeToRegular:", error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      console.log("Calling deleteCustomer with id:", id);
      const response = await api.delete(`/customers/${id}`);
      console.log("API Response deleteCustomer:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error deleteCustomer:", error);
      throw error;
    }
  },

  getMyCustomerInfo: async () => {
    try {
      console.log("Calling getMyCustomerInfo");
      const response = await api.get("/customers/me");
      console.log("API Response getMyCustomerInfo:", response.data);
      return handleSingleCustomerResponse(response.data);
    } catch (error) {
      console.error("Error getMyCustomerInfo:", error);
      throw error;
    }
  },

  updateMyCustomerInfo: async (customerData) => {
    try {

      const requestData = {
        customerName: customerData.customerName || customerData.name,
        phoneNumber: customerData.phoneNumber || customerData.phone,
        address: customerData.address,

      };

      console.log("Calling updateMyCustomerInfo with data:", requestData);
      const response = await api.put("/customers/me", requestData);
      console.log("API Response updateMyCustomerInfo:", response.data);
      return handleSingleCustomerResponse(response.data);
    } catch (error) {
      console.error("Error updateMyCustomerInfo:", error);
      throw error;
    }
  },
};
