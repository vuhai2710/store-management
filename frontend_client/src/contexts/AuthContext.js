import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";
import { customerService } from "../services/customerService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Try to get customer info from API
          try {
            const customerData = await customerService.getMyProfile();
            setCustomer(customerData);
            setUser(customerData);
            setIsAuthenticated(true);
          } catch (error) {
            // If API call fails, token might be invalid
            // Clear storage and set not authenticated
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

  /**
   * Login
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {boolean} rememberMe - Remember me flag
   * @returns {Promise<void>}
   */
  const login = async (username, password, rememberMe = false) => {
    try {
      // Don't set isLoading here - let LoginPage manage its own loading state
      // This prevents AppContent from re-rendering and unmounting LoginPage
      const response = await authService.login(
        { username, password },
        rememberMe
      );

      // Backend login only returns { token, authenticated }, NOT user info
      // We need to fetch profile to check the role
      try {
        const customerData = await customerService.getMyProfile();

        // Check if user is ADMIN or EMPLOYEE -> redirect to admin site
        // Note: Role comes as "ADMIN" or "EMPLOYEE" (without ROLE_ prefix)
        const userRole = customerData?.user?.role || customerData?.role;
        if (userRole === "ADMIN" || userRole === "EMPLOYEE") {
          const token = authService.getToken();
          // Redirect to admin site with token
          window.location.href = `http://localhost:3000?token=${token}`;
          return response;
        }

        // For CUSTOMER, set the customer data
        setCustomer(customerData);
        setUser(customerData);
        setIsAuthenticated(true);
      } catch (profileError) {
        console.error("Error fetching profile after login:", profileError);
        // If profile fetch fails, user might be ADMIN/EMPLOYEE who can't access customer profile
        // Redirect to admin site to let them try there
        const token = authService.getToken();
        if (token) {
          window.location.href = `http://localhost:3000?token=${token}`;
          return response;
        }
        throw profileError;
      }

      return response;
    } catch (error) {
      // api.js interceptor transforms error to { message, status, errors, responseData, ... }
      const status = error?.status;

      // For authentication errors (400, 401, 403), always show generic message for security
      if (status === 400 || status === 401 || status === 403) {
        throw new Error("Tài khoản hoặc mật khẩu không đúng");
      }

      // For other errors, use backend message or generic message
      const backendMessage = error?.message || error?.responseData?.message;
      throw new Error(
        backendMessage || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    }
  };

  /**
   * Register
   * @param {Object} registerData - Registration data
   * @returns {Promise<void>}
   */
  const register = async (registerData) => {
    // NOTE: Don't set isLoading here - let RegisterPage manage its own loading state
    // Setting isLoading(true) causes AppContent to re-render, which unmounts RegisterPage
    try {
      const response = await authService.register(registerData);

      // Fetch customer info
      const customerData = await customerService.getMyProfile();
      setCustomer(customerData);
      setUser(customerData);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      console.error("Register error:", error);

      // api.js interceptor transforms error to { message, status, errors, responseData, ... }
      const status = error?.status;
      const fieldErrors = error?.errors || error?.responseData?.errors;

      // Create enhanced error with field errors
      const enhancedError = new Error(error?.message || "Đăng ký thất bại. Vui lòng thử lại.");
      enhancedError.status = status;
      enhancedError.fieldErrors = fieldErrors;

      throw enhancedError;
    }
  };

  /**
   * Logout
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setCustomer(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      setUser(null);
      setCustomer(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user/customer
   * @param {Object} userData - User data
   */
  const updateUser = (userData) => {
    setUser(userData);
    setCustomer(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("customer", JSON.stringify(userData));
  };

  /**
   * Refresh user data
   * @returns {Promise<void>}
   */
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

/**
 * Use auth context hook
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values instead of throwing error
    // This allows components to use useAuth without AuthProvider
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
