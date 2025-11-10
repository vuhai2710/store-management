/**
 * Custom Hook - useAuth
 * Hook để quản lý authentication state
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, logout } from "../store/slices/authSlice";
import { authService } from "../services/authService";
import { isTokenExpired } from "../utils/apiHelper";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Kiểm tra token khi component mount
    const checkAuth = async () => {
      const token = authService.getToken();

      if (!token) {
        dispatch(setLoading(false));
        return;
      }

      // Kiểm tra token expired
      if (isTokenExpired(token)) {
        dispatch(logout());
        return;
      }

      // Lấy user info từ localStorage hoặc API
      try {
        const storedUser = authService.getUserFromStorage();
        if (storedUser) {
          dispatch(setUser(storedUser));
        } else {
          // Fetch từ API nếu không có trong localStorage
          const currentUser = await authService.getCurrentUser();
          dispatch(setUser(currentUser));
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
  };
};
