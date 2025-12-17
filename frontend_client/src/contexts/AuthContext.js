import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";
import { customerService } from "../services/customerService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = authService.getToken();
        if (token) {

          try {
            const customerData = await customerService.getMyProfile();
            setCustomer(customerData);
            setUser(customerData);
            setIsAuthenticated(true);
          } catch (error) {

            authService.logout();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username, password, rememberMe = false) => {
    try {

      const response = await authService.login(
        { username, password },
        rememberMe
      );

      try {
        const customerData = await customerService.getMyProfile();

        const userRole = customerData?.user?.role || customerData?.role;
        if (userRole === "ADMIN" || userRole === "EMPLOYEE") {
          const token = authService.getToken();

          window.location.href = `http://localhost:3000?token=${token}`;
          return response;
        }

        setCustomer(customerData);
        setUser(customerData);
        setIsAuthenticated(true);
      } catch (profileError) {
        console.error("Error fetching profile after login:", profileError);

        const token = authService.getToken();
        if (token) {
          window.location.href = `http://localhost:3000?token=${token}`;
          return response;
        }
        throw profileError;
      }

      return response;
    } catch (error) {

      const status = error?.status;

      if (status === 400 || status === 401 || status === 403) {
        throw new Error("Tài khoản hoặc mật khẩu không đúng");
      }

      const backendMessage = error?.message || error?.responseData?.message;
      throw new Error(
        backendMessage || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    }
  };

  const register = async (registerData) => {

    try {
      const response = await authService.register(registerData);

      const customerData = await customerService.getMyProfile();
      setCustomer(customerData);
      setUser(customerData);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      console.error("Register error:", error);

      const status = error?.status;
      const fieldErrors = error?.errors || error?.responseData?.errors;

      const enhancedError = new Error(error?.message || "Đăng ký thất bại. Vui lòng thử lại.");
      enhancedError.status = status;
      enhancedError.fieldErrors = fieldErrors;

      throw enhancedError;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setCustomer(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);

      setUser(null);
      setCustomer(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    setCustomer(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("customer", JSON.stringify(userData));
  };

  const refreshUser = async () => {
    try {
      const customerData = await customerService.getMyProfile();
      setCustomer(customerData);
      setUser(customerData);
      localStorage.setItem("user", JSON.stringify(customerData));
      localStorage.setItem("customer", JSON.stringify(customerData));
    } catch (error) {
      console.error("Error refreshing user:", error);
      throw error;
    }
  };

  const value = {
    user,
    customer,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {

    console.warn(
      "useAuth được gọi ngoài AuthProvider - sử dụng fallback values"
    );
    return {
      user: null,
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => {
        throw new Error("AuthProvider chưa được khởi tạo");
      },
      register: async () => {
        throw new Error("AuthProvider chưa được khởi tạo");
      },
      logout: () => { },
      updateProfile: async () => { },
    };
  }
  return context;
};
