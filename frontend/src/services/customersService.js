import api from "./api";

// Helper function để transform customer data từ Backend sang Frontend format
const transformCustomer = (customer) => ({
  id: customer.idCustomer,
  userId: customer.idUser,
  name: customer.customerName,
  fullName: customer.customerName,
  email: customer.email,
  phone: customer.phoneNumber,
  phoneNumber: customer.phoneNumber,
  address: customer.address,
  username: customer.username,
  customerType: customer.customerType || "REGULAR",
  status: "active",
  avatar: null,
  createdAt: customer.createdAt || new Date().toISOString(),
  updatedAt: customer.updatedAt || new Date().toISOString(),
});

// Helper function để xử lý response và transform data
const handleCustomerResponse = (response) => {
  // Transform data array
  const transformData = (customers) => {
    if (!Array.isArray(customers)) return [];
    return customers.map(transformCustomer);
  };

  // Check if response has PageResponse format (content, totalElements, pageNo, etc.)
  if (
    response.data &&
    response.data.content &&
    Array.isArray(response.data.content)
  ) {
    const transformedData = transformData(response.data.content);
    return {
      data: transformedData,
      total: response.data.totalElements || transformedData.length,
      pageNo: response.data.pageNo,
      pageSize: response.data.pageSize,
      totalPages: response.data.totalPages,
      isFirst: response.data.isFirst,
      isLast: response.data.isLast,
      hasNext: response.data.hasNext,
      hasPrevious: response.data.hasPrevious,
      isEmpty: response.data.isEmpty,
    };
  }

  // Handle array response (for backward compatibility)
  if (Array.isArray(response.data)) {
    const transformedData = transformData(response.data);
    return {
      data: transformedData,
      total: transformedData.length,
    };
  }

  return response.data;
};

export const customersService = {
  // Lấy tất cả customers với phân trang (ADMIN, EMPLOYEE)
  // Backend expects: pageNo (base-1), pageSize, sortBy, sortDirection
  getAllCustomers: async (params = {}) => {
    try {
      const requestParams = {
        pageNo: params.pageNo || params.page || 1, // Base-1 (Frontend giống Backend)
        pageSize: params.pageSize || params.limit || 5,
        sortBy: params.sortBy || "idCustomer",
        sortDirection: params.sortDirection || "ASC",
      };

      console.log("Calling getAllCustomers with params:", requestParams);
      const response = await api.get("/customers", { params: requestParams });
      console.log("API Response getAllCustomers:", response);
      return handleCustomerResponse(response);
    } catch (error) {
      console.error("Error getAllCustomers:", error);
      throw error;
    }
  },

  // Alias cho getAllCustomers - dùng cho pagination/filtering
  // Tự động chọn endpoint dựa vào params
  getCustomers: async (params = {}) => {
    // Nếu có name hoặc phone, dùng searchCustomers endpoint
    if (params.name || params.phone) {
      return customersService.searchCustomers(params);
    }
    // Nếu không có search, dùng getAllCustomers
    return customersService.getAllCustomers(params);
  },

  // Lấy customer theo ID (ADMIN, EMPLOYEE)
  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      const customer = response.data;
      return transformCustomer(customer);
    } catch (error) {
      console.error("Error getCustomerById:", error);
      throw error;
    }
  },

  // Tìm kiếm customers với phân trang (ADMIN, EMPLOYEE)
  // Backend expects: name, phone, pageNo (base-1), pageSize, sortBy, sortDirection
  searchCustomers: async (params = {}) => {
    try {
      const requestParams = {
        pageNo: params.pageNo || params.page || 1, // Base-1
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
      console.log("API Response searchCustomers:", response);
      return handleCustomerResponse(response);
    } catch (error) {
      console.error("Error searchCustomers:", error);
      throw error;
    }
  },

  // Lấy customers theo loại (ADMIN, EMPLOYEE)
  // Backend expects: type (REGULAR, VIP) - returns List without pagination
  getCustomersByType: async (type) => {
    try {
      // Đảm bảo type viết hoa như Backend expects
      const typeUpperCase = type.toUpperCase();
      console.log("Calling getCustomersByType with type:", typeUpperCase);
      const response = await api.get(`/customers/type/${typeUpperCase}`);
      console.log("API Response getCustomersByType:", response);

      // Endpoint này không có phân trang, trả về array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data.map(transformCustomer);
      }

      return response.data;
    } catch (error) {
      console.error("Error getCustomersByType:", error);
      throw error;
    }
  },

  // Cập nhật customer (ADMIN, EMPLOYEE)
  // Backend expects CustomerDto with validation
  updateCustomer: async (id, customerData) => {
    try {
      // Transform frontend data to match CustomerDto
      const requestData = {
        customerName: customerData.customerName || customerData.name,
        email: customerData.email,
        phoneNumber: customerData.phoneNumber || customerData.phone,
        address: customerData.address,
      };

      console.log("Calling updateCustomer with id:", id, "data:", requestData);
      const response = await api.put(`/customers/${id}`, requestData);
      console.log("API Response updateCustomer:", response);
      return transformCustomer(response.data);
    } catch (error) {
      console.error("Error updateCustomer:", error);
      throw error;
    }
  },

  // Nâng cấp customer lên VIP (ADMIN only)
  upgradeToVip: async (id) => {
    try {
      console.log("Calling upgradeToVip with id:", id);
      const response = await api.patch(`/customers/${id}/upgrade-vip`);
      console.log("API Response upgradeToVip:", response);
      return transformCustomer(response.data);
    } catch (error) {
      console.error("Error upgradeToVip:", error);
      throw error;
    }
  },

  // Hạ cấp customer xuống REGULAR (ADMIN only)
  downgradeToRegular: async (id) => {
    try {
      console.log("Calling downgradeToRegular with id:", id);
      const response = await api.patch(`/customers/${id}/downgrade-regular`);
      console.log("API Response downgradeToRegular:", response);
      return transformCustomer(response.data);
    } catch (error) {
      console.error("Error downgradeToRegular:", error);
      throw error;
    }
  },

  // Xóa customer (ADMIN only)
  deleteCustomer: async (id) => {
    try {
      console.log("Calling deleteCustomer with id:", id);
      const response = await api.delete(`/customers/${id}`);
      console.log("API Response deleteCustomer:", response);
      // Backend returns void (null)
      return response.data;
    } catch (error) {
      console.error("Error deleteCustomer:", error);
      throw error;
    }
  },

  // Cập nhật thông tin customer của chính mình (CUSTOMER role)
  // Backend endpoint: PUT /customers/me
  updateMyCustomerInfo: async (customerData) => {
    try {
      // Transform frontend data to match CustomerDto
      const requestData = {
        customerName: customerData.customerName || customerData.name,
        email: customerData.email,
        phoneNumber: customerData.phoneNumber || customerData.phone,
        address: customerData.address,
      };

      console.log("Calling updateMyCustomerInfo with data:", requestData);
      const response = await api.put("/customers/me", requestData);
      console.log("API Response updateMyCustomerInfo:", response);
      return transformCustomer(response.data);
    } catch (error) {
      console.error("Error updateMyCustomerInfo:", error);
      throw error;
    }
  },
};
