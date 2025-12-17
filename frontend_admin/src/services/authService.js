import api from "./api";

export const authService = {
  // Register - Đăng ký tài khoản mới
  // Backend returns: { token, authenticated } (NO userInfo)
  // Need to call /users/profile after register to get user info
  register: async (registerData) => {
    try {
      const response = await api.post("/auth/register", registerData);
      // Backend only returns { token, authenticated }
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        // Fetch user info from /users/profile after register
        try {
          const userResponse = await api.get("/users/profile");
          if (userResponse.data) {
            localStorage.setItem("user", JSON.stringify(userResponse.data));
          }
        } catch (userError) {
          console.error("Error fetching user info after register:", userError);
          // Still save token even if fetching user info fails
        }
      }
      return response.data;
    } catch (error) {
      // api.js interceptor transforms error to { message, status, errors, ... }
      const status = error.status;
      if (status === 400) {
        throw new Error(error.message || "Thông tin đăng ký không hợp lệ");
      }
      if (status === 409) {
        throw new Error("Tên đăng nhập hoặc email đã tồn tại");
      }
      throw new Error(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  },

  // Login - Đăng nhập
  // Backend returns: { token, authenticated } (NO userInfo)
  // Need to call /users/profile after login to get user info
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      // Backend only returns { token, authenticated }
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        // Fetch user info from /users/profile after login
        try {
          const userResponse = await api.get("/users/profile");
          if (userResponse.data) {
            localStorage.setItem("user", JSON.stringify(userResponse.data));
          }
        } catch (userError) {
          console.error("Error fetching user info after login:", userError);
          // Still save token even if fetching user info fails
        }
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout - Đăng xuất
  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      // Xóa token và user info khỏi localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return response.data;
    } catch (error) {
      // Vẫn xóa local data ngay cả khi API call thất bại
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  },

  // Get current user - Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    try {
      const response = await api.get("/users/profile");
      // API interceptor đã unwrap response.data.data thành response.data
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password - Quên mật khẩu
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      // Backend returns { code, message, data: null }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password - Đặt lại mật khẩu
  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user from localStorage
  getUserFromStorage: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Upload avatar
  uploadAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const response = await api.post("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Update user in localStorage
      if (response.data?.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update avatar
  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const response = await api.put("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Update user in localStorage
      if (response.data?.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update profile - Note: Backend only allows ADMIN to update users via PUT /users/{id}
  // For non-ADMIN users, this will fail. We'll try anyway and show appropriate error.
  updateProfile: async (userId, profileData) => {
    try {
      const response = await api.put(`/users/${userId}`, profileData);
      // Update user in localStorage
      if (response.data?.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
