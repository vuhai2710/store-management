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
    // Set loading true khi bắt đầu check auth
    dispatch(setLoading(true));
    
    // Kiểm tra token khi component mount
    const checkAuth = async () => {
      try {
        const token = authService.getToken();

        if (!token) {
          dispatch(setLoading(false));
          return;
        }

        // Kiểm tra token expired
        if (isTokenExpired && isTokenExpired(token)) {
          dispatch(logout());
          dispatch(setLoading(false));
          return;
        }

        // Lấy user info từ localStorage trước (nhanh hơn)
        const storedUser = authService.getUserFromStorage();
        if (storedUser) {
          dispatch(setUser(storedUser));
          dispatch(setLoading(false));
          // Optionally validate với backend trong background
          authService.getCurrentUser().catch(() => {
            // Nếu token không hợp lệ, sẽ tự logout
          });
        } else {
          // Fetch từ API nếu không có trong localStorage
          try {
            const currentUser = await authService.getCurrentUser();
            dispatch(setUser(currentUser));
          } catch (error) {
            console.error("Error fetching current user:", error);
            dispatch(logout());
          } finally {
            dispatch(setLoading(false));
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        dispatch(logout());
        dispatch(setLoading(false));
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
