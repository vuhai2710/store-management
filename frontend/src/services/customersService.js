import api from "./api";

export const customersService = {
  // Lấy tất cả customers (ADMIN, EMPLOYEE)
  getAllCustomers: async () => {
    try {
      const response = await api.get("/customers");
      console.log("API Response getAllCustomers:", response);
      return response.data;
    } catch (error) {
      console.error("Error getAllCustomers:", error);
      throw error;
    }
  },

  // Alias cho getAllCustomers - dùng cho pagination/filtering
  getCustomers: async (params = {}) => {
    try {
      console.log("Calling getCustomers with params:", params);
      const response = await api.get("/customers", { params });
      console.log("API Response getCustomers:", response);

      // Transform data để match Frontend expects
      const transformData = (customers) => {
        if (!Array.isArray(customers)) return [];

        return customers.map((customer) => ({
          // Map Backend DTO fields -> Frontend fields
          id: customer.idCustomer, // idCustomer -> id
          userId: customer.idUser, // idUser -> userId
          name: customer.customerName, // customerName -> name
          fullName: customer.customerName, // customerName -> fullName
          email: customer.email, // ✓
          phone: customer.phoneNumber, // phoneNumber -> phone
          phoneNumber: customer.phoneNumber, // ✓
          address: customer.address, // ✓
          username: customer.username, // ✓
          customerType: customer.customerType?.toLowerCase() || "regular", // REGULAR -> regular
          status: "active", // Default
          avatar: null, // Default
          createdAt: customer.createdAt || new Date().toISOString(), // ✓
        }));
      };

      // Spring Boot trả về array, transform và wrap cho pagination
      if (Array.isArray(response.data)) {
        const transformedData = transformData(response.data);
        return {
          data: transformedData,
          total: transformedData.length,
        };
      }

      return response.data;
    } catch (error) {
      console.error("Error getCustomers:", error);
      throw error;
    }
  },

  // Lấy customer theo ID (ADMIN, EMPLOYEE)
  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      const customer = response.data;

      // Transform single customer data
      return {
        id: customer.idCustomer,
        userId: customer.idUser,
        name: customer.customerName,
        fullName: customer.customerName,
        email: customer.email,
        phone: customer.phoneNumber,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        username: customer.username,
        customerType: customer.customerType?.toLowerCase() || "regular",
        status: "active",
        avatar: null,
        createdAt: customer.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getCustomerById:", error);
      throw error;
    }
  },

  // Tìm kiếm customers (ADMIN, EMPLOYEE)
  searchCustomers: async (name = null, phone = null) => {
    try {
      const params = {};
      if (name) params.name = name;
      if (phone) params.phone = phone;

      const response = await api.get("/customers/search", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy customers theo loại (ADMIN, EMPLOYEE)
  getCustomersByType: async (type) => {
    try {
      const response = await api.get(`/customers/type/${type}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật customer (ADMIN, EMPLOYEE)
  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Nâng cấp customer lên VIP (ADMIN only)
  upgradeToVip: async (id) => {
    try {
      const response = await api.patch(`/customers/${id}/upgrade-vip`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Hạ cấp customer xuống REGULAR (ADMIN only)
  downgradeToRegular: async (id) => {
    try {
      const response = await api.patch(`/customers/${id}/downgrade-regular`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa customer (ADMIN only)
  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin customer của chính mình (CUSTOMER role)
  getMyCustomerInfo: async () => {
    try {
      const response = await api.get("/customers/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin customer của chính mình (CUSTOMER role)
  updateMyCustomerInfo: async (customerData) => {
    try {
      const response = await api.put("/customers/me", customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
