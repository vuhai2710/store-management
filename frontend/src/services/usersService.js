import api from "./api";

export const usersService = {
  // Lấy tất cả users với phân trang (ADMIN only)
  getAllUsers: async (
    pageNo = 1,
    pageSize = 5,
    sortBy = "idUser",
    sortDirection = "ASC"
  ) => {
    try {
      const response = await api.get("/users", {
        params: {
          pageNo,
          pageSize,
          sortBy,
          sortDirection,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy user theo ID (ADMIN only)
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật user (ADMIN only)
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vô hiệu hóa user (ADMIN only)
  deactivateUser: async (id) => {
    try {
      const response = await api.patch(`/users/${id}/deactivate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Kích hoạt user (ADMIN only)
  activateUser: async (id) => {
    try {
      const response = await api.patch(`/users/${id}/activate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thay đổi role của user (ADMIN only)
  changeUserRole: async (id, role) => {
    try {
      const response = await api.patch(`/users/${id}/role`, null, {
        params: { role },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa user (ADMIN only)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy profile của user hiện tại (Authenticated users)
  getMyProfile: async () => {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
