import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { customerService } from '../services/customerService';

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
        console.error('Error loading user:', error);
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
      setIsLoading(true);
      const response = await authService.login({ username, password }, rememberMe);
      
      // Fetch customer info
      const customerData = await customerService.getMyProfile();
      setCustomer(customerData);
      setUser(customerData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register
   * @param {Object} registerData - Registration data
   * @returns {Promise<void>}
   */
  const register = async (registerData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(registerData);
      
      // Fetch customer info
      const customerData = await customerService.getMyProfile();
      setCustomer(customerData);
      setUser(customerData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
      console.error('Logout error:', error);
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
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('customer', JSON.stringify(userData));
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
      localStorage.setItem('user', JSON.stringify(customerData));
      localStorage.setItem('customer', JSON.stringify(customerData));
    } catch (error) {
      console.error('Error refreshing user:', error);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


