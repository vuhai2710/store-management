import api from "./api";

export const authService = {

  register: async (registerData) => {
    try {
      const response = await api.post("/auth/register", registerData);

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);

        try {
          const userResponse = await api.get("/users/profile");
          if (userResponse.data) {
            localStorage.setItem("user", JSON.stringify(userResponse.data));
          }
        } catch (userError) {
          console.error("Error fetching user info after register:", userError);

        }
      }
      return response.data;
    } catch (error) {

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

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);

        try {
          const userResponse = await api.get("/users/profile");
          if (userResponse.data) {
            localStorage.setItem("user", JSON.stringify(userResponse.data));
          }
        } catch (userError) {
          console.error("Error fetching user info after login:", userError);

        }
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return response.data;
    } catch (error) {

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/users/profile");

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

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

  getUserFromStorage: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  uploadAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const response = await api.post("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const response = await api.put("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      const response = await api.put(`/users/${userId}`, profileData);

      if (response.data?.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
