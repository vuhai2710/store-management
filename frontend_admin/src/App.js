/**
 * App.js - CẬP NHẬT với Authentication Flow
 *
 * File này là bản cập nhật của App.js hiện tại
 * Tích hợp đầy đủ authentication và protected routes
 */

import React, { useEffect } from "react";
import { Layout } from "antd";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { USER_ROLES, APP_CONFIG } from "./constants";
import { useAuth } from "./hooks";

// Layout Components
import AppHeader from "./components/layout/AppHeader";
import AppSidebar from "./components/layout/AppSidebar";
import Breadcrumbs from "./components/common/Breadcrumbs";
import FloatingChatButton from "./components/chat/FloatingChatButton";

// Common Components
// giữ 1 dòng import duy nhất

// Pages
import Users from "./pages/Users";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import ImportOrders from "./pages/ImportOrders";
import ImportOrderDetail from "./pages/ImportOrderDetail";
import ShipmentDetail from "./pages/ShipmentDetail";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";

const { Content } = Layout;

// Thêm block này
const PublicRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

function App() {
  const { user, isAuthenticated, loading } = useAuth();

  // Kiểm tra và redirect CUSTOMER sang frontend_client
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === USER_ROLES.CUSTOMER) {
      const token = localStorage.getItem("token");
      if (token) {
        const clientUrl = APP_CONFIG.CLIENT_URL;
        // Chuyển hướng sang frontend_client với token
        window.location.href = `${clientUrl}?token=${token}`;
      }
    }
  }, [loading, isAuthenticated, user]);

  // Loading state - hiển thị loading screen trước khi check auth
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "24px", marginBottom: "16px" }}>Đang tải...</div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập → render PublicRoutes
  if (!isAuthenticated) {
    return <PublicRoutes />;
  }

  // Nếu là CUSTOMER, hiển thị loading trong khi redirect
  if (user?.role === USER_ROLES.CUSTOMER) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "24px", marginBottom: "16px" }}>Đang chuyển hướng...</div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }

  // Protected routes (đã đăng nhập)
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout>
        <AppHeader user={user} />
        <Content 
          style={{ 
            margin: "24px 16px", 
            padding: 24, 
            minHeight: 280,
            transition: "all 0.2s",
          }}
        >
          <Breadcrumbs />
          <Routes>
            {/* Public trong authenticated area */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard - Tất cả roles */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Profile - Tất cả roles */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Orders - ADMIN, EMPLOYEE */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />

            {/* Products - ADMIN, EMPLOYEE */}
            <Route
              path="/products"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />

            {/* Customers - ADMIN, EMPLOYEE */}
            <Route
              path="/customers"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <CustomerDetail />
                </ProtectedRoute>
              }
            />

            {/* Inventory - ADMIN, EMPLOYEE */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <Suppliers />
                </ProtectedRoute>
              }
            />

            {/* Categories - ADMIN, EMPLOYEE */}
            <Route
              path="/categories"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <Categories />
                </ProtectedRoute>
              }
            />

            {/* Import Orders - ADMIN, EMPLOYEE */}
            <Route
              path="/import-orders"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <ImportOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/import-orders/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <ImportOrderDetail />
                </ProtectedRoute>
              }
            />

            {/* Shipments - ADMIN, EMPLOYEE */}
            <Route
              path="/shipments/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <ShipmentDetail />
                </ProtectedRoute>
              }
            />

            {/* Employees - ADMIN only */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <EmployeeDetail />
                </ProtectedRoute>
              }
            />

            {/* Finance - ADMIN only */}
            <Route
              path="/finance"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <Finance />
                </ProtectedRoute>
              }
            />

            {/* Reports - ADMIN only */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Trang quản lý người dùng - chỉ ADMIN */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
      <FloatingChatButton />
    </Layout>
  );
}

export default App;
