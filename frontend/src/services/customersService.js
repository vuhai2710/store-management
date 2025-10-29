import api from "./api";

// Helper function để parse date từ format dd/MM/yyyy sang ISO string
const parseBackendDate = (dateString) => {
  if (!dateString) return new Date().toISOString();

  // Nếu đã là ISO string, trả về luôn
  if (dateString.includes("T") || dateString.includes("-")) {
    return dateString;
  }

  // Parse format dd/MM/yyyy từ backend
  const parts = dateString.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    // Tạo ISO string: yyyy-MM-dd
    return new Date(`${year}-${month}-${day}`).toISOString();
  }

  return new Date().toISOString();
};

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
  createdAt: parseBackendDate(customer.createdAt),
  updatedAt: parseBackendDate(customer.updatedAt),
});

// Helper function để xử lý PageResponse<CustomerDto> từ Backend
// Note: API interceptor đã extract response.data.data, nên response.data chính là PageResponse
const handlePageResponse = (pageResponse) => {
  // pageResponse = { content, pageNo, pageSize, totalElements, totalPages, isFirst, isLast, hasNext, hasPrevious, isEmpty }
  // Note: Backend returns pageNo as 0-indexed, we need to convert to 1-indexed for frontend

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
    pageNo: (pageResponse.pageNo || 0) + 1, // Convert from 0-indexed to 1-indexed
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

// Helper function để xử lý CustomerDto từ Backend
// Note: API interceptor đã extract response.data.data, nên response.data chính là CustomerDto
const handleSingleCustomerResponse = (customerDto) => {
  // customerDto = CustomerDto object

  if (!customerDto) {
    throw new Error("Invalid response from server");
  }

  return transformCustomer(customerDto);
};
export const customersService = {
  // Lấy tất cả customers với phân trang (ADMIN, EMPLOYEE)
  // Backend: GET /api/v1/customers?pageNo=1&pageSize=5&sortBy=idCustomer&sortDirection=ASC
  // Returns: ApiResponse<PageResponse<CustomerDto>>
  getAllCustomers: async (params = {}) => {
    try {
      const requestParams = {
        pageNo: params.pageNo || params.page || 1, // Base-1 (Backend expects 1-indexed)
        pageSize: params.pageSize || params.limit || 5,
        sortBy: params.sortBy || "idCustomer",
        sortDirection: params.sortDirection || "ASC",
      };

      console.log("Calling getAllCustomers with params:", requestParams);
      const response = await api.get("/customers", { params: requestParams });
      console.log("API Response getAllCustomers:", response.data);
      return handlePageResponse(response.data);
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
  // Backend: GET /api/v1/customers/{id}
  // Returns: ApiResponse<CustomerDto>
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

  // Tìm kiếm customers với phân trang (ADMIN, EMPLOYEE)
  // Backend: GET /api/v1/customers/search?name=...&phone=...&pageNo=1&pageSize=5&sortBy=idCustomer&sortDirection=ASC
  // Returns: ApiResponse<PageResponse<CustomerDto>>
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

  // Lấy customers theo loại (ADMIN, EMPLOYEE)
  // Backend: GET /api/v1/customers/type/{type}?pageNo=1&pageSize=5&sortBy=idCustomer&sortDirection=ASC
  // Returns: ApiResponse<PageResponse<CustomerDto>>
  getCustomersByType: async (type, params = {}) => {
    try {
      // Đảm bảo type viết hoa như Backend expects (REGULAR, VIP)
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

  // Cập nhật customer (ADMIN, EMPLOYEE)
  // Backend: PUT /api/v1/customers/{id}
  // Body: CustomerDto (customerName, phoneNumber, address, customerType)
  // Returns: ApiResponse<CustomerDto>
  // Note: Backend KHÔNG cho phép cập nhật email
  // Backend validation:
  //   - phoneNumber: ^0\d{9}$ (10 digits starting with 0)
  //   - customerType: REGULAR hoặc VIP
  updateCustomer: async (id, customerData) => {
    try {
      // Transform frontend data to match CustomerDto
      // Chỉ gửi các trường backend cho phép cập nhật
      const requestData = {
        customerName: customerData.customerName || customerData.name,
        phoneNumber: customerData.phoneNumber || customerData.phone, // Must match: ^0\d{9}$
        address: customerData.address,
        customerType: customerData.customerType, // REGULAR hoặc VIP
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

  // Tạo mới customer
  // Note: Backend không có endpoint POST /customers để tạo trực tiếp
  // Customer chỉ có thể được tạo qua /auth/register
  // Method này giữ lại cho tương lai nếu backend thêm endpoint
  createCustomer: async (customerData) => {
    try {
      const requestData = {
        customerName: customerData.customerName || customerData.name,
        email: customerData.email,
        phoneNumber: customerData.phoneNumber || customerData.phone,
        address: customerData.address,
      };

      console.log("Calling createCustomer with data:", requestData);
      const response = await api.post("/customers", requestData);
      console.log("API Response createCustomer:", response.data);
      return handleSingleCustomerResponse(response.data);
    } catch (error) {
      console.error("Error createCustomer:", error);
      // Backend chưa có endpoint này, sử dụng registerCustomer thay thế
      throw error;
    }
  },

  // Đăng ký customer mới qua Auth Register
  registerCustomer: async (formData) => {
    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        customerName: formData.name || formData.customerName,
        phoneNumber: formData.phone || formData.phoneNumber,
        address: formData.address,
      };

      console.log("Calling registerCustomer with data:", payload);
      const response = await api.post("/auth/register", payload);
      console.log("API Response registerCustomer:", response);
      return response.data; // Returns token/username/role
    } catch (error) {
      console.error("Error registerCustomer:", error);
      throw error;
    }
  },

  // Nâng cấp customer lên VIP (ADMIN only)
  // Backend: PATCH /api/v1/customers/{id}/upgrade-vip
  // Returns: ApiResponse<CustomerDto>
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

  // Hạ cấp customer xuống REGULAR (ADMIN only)
  // Backend: PATCH /api/v1/customers/{id}/downgrade-regular
  // Returns: ApiResponse<CustomerDto>
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

  // Xóa customer (ADMIN only)
  // Backend: DELETE /api/v1/customers/{id}
  // Returns: ApiResponse<Void> (data is null)
  deleteCustomer: async (id) => {
    try {
      console.log("Calling deleteCustomer with id:", id);
      const response = await api.delete(`/customers/${id}`);
      console.log("API Response deleteCustomer:", response.data);
      // Backend returns ApiResponse with data: null
      return response.data;
    } catch (error) {
      console.error("Error deleteCustomer:", error);
      throw error;
    }
  },

  // Cập nhật thông tin customer của chính mình (CUSTOMER role)
  // Backend: PUT /api/v1/customers/me
  // Body: CustomerDto (customerName, email, phoneNumber, address)
  // Returns: ApiResponse<CustomerDto>
  updateMyCustomerInfo: async (customerData) => {
    try {
      // Transform frontend data to match CustomerDto with validation
      const requestData = {
        customerName: customerData.customerName || customerData.name,
        email: customerData.email, // Must match: ^[A-Za-z0-9._%+-]+@gmail\.com$
        phoneNumber: customerData.phoneNumber || customerData.phone, // Must match: ^0\d{9}$
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
