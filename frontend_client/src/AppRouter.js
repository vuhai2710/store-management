// AppRouter.js - Router cho các trang cần Auth
import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import CheckoutPage from "./components/pages/CheckoutPage";
import OrderSuccessPage from "./components/pages/OrderSuccessPage";
import MyOrdersPage from "./components/pages/MyOrdersPage";
import OrderDetailPage from "./components/pages/OrderDetailPage";

/**
 * Wrapper cho các trang cần AuthProvider
 * Chỉ dùng khi cần useAuth hook
 */
export const withAuth = (Component) => {
  return (props) => (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  );
};

// Export các page đã wrap với Auth
export const AuthenticatedCheckoutPage = withAuth(CheckoutPage);
export const AuthenticatedOrderSuccessPage = withAuth(OrderSuccessPage);
export const AuthenticatedMyOrdersPage = withAuth(MyOrdersPage);
export const AuthenticatedOrderDetailPage = withAuth(OrderDetailPage);
