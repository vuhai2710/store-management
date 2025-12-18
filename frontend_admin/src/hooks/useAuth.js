import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, logout } from "../store/slices/authSlice";
import { authService } from "../services/authService";
import { isTokenExpired } from "../utils/apiHelper";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {

    dispatch(setLoading(true));

    const checkAuth = async () => {
      try {
        const token = authService.getToken();

        if (!token) {
          dispatch(setLoading(false));
          return;
        }

        if (isTokenExpired && isTokenExpired(token)) {
          dispatch(logout());
          dispatch(setLoading(false));
          return;
        }

        const storedUser = authService.getUserFromStorage();
        if (storedUser) {
          dispatch(setUser(storedUser));
          dispatch(setLoading(false));

          authService.getCurrentUser().catch(() => {

          });
        } else {

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
