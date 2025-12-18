import React, { useEffect } from "react";
import { Layout } from "antd";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { USER_ROLES, APP_CONFIG } from "./constants";
import { useAuth } from "./hooks";

import AppHeader from "./components/layout/AppHeader";
import AppSidebar from "./components/layout/AppSidebar";
import Breadcrumbs from "./components/common/Breadcrumbs";
import FloatingChatButton from "./components/chat/FloatingChatButton";

import Users from "./pages/Users";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
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
import SupplierDetail from "./pages/SupplierDetail";
import Categories from "./pages/Categories";
import ImportOrders from "./pages/ImportOrders";
import ImportOrderDetail from "./pages/ImportOrderDetail";
import ShipmentDetail from "./pages/ShipmentDetail";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import Promotions from "./pages/Promotions";
import ProductReviews from "./pages/ProductReviews";
import ReturnListPage from "./pages/orderReturns/ReturnListPage";
import ReturnDetailPage from "./pages/orderReturns/ReturnDetailPage";
import ReturnSettingPage from "./pages/system/ReturnSettingPage";
import ExportInvoices from "./pages/ExportInvoices";
import ImportInvoices from "./pages/ImportInvoices";

const { Content } = Layout;

const PublicRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

function App() {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const path = window.location.pathname;

    if (tokenFromUrl && !path.startsWith('/reset-password')) {
      console.log("Received auth token from redirect, saving to localStorage");
      localStorage.setItem("token", tokenFromUrl);

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('token');
      window.history.replaceState({}, '', newUrl.pathname + newUrl.search);

      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === USER_ROLES.CUSTOMER) {
      const token = localStorage.getItem("token");
      if (token) {
        const clientUrl = APP_CONFIG.CLIENT_URL;

        window.location.href = `${clientUrl}?token=${token}`;
      }
    }
  }, [loading, isAuthenticated, user]);

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
          <div style={{ fontSize: "24px", marginBottom: "16px" }}>
            Đang tải...
          </div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            Vui lòng chờ trong giây lát
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PublicRoutes />;
  }

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
          <div style={{ fontSize: "24px", marginBottom: "16px" }}>
            Đang chuyển hướng...
          </div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            Vui lòng chờ trong giây lát
          </div>
        </div>
      </div>
    );
  }

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
          }}>
          <Breadcrumbs />
          <Routes>
            { }
            <Route path="/unauthorized" element={<Unauthorized />} />

            { }
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            { }
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            { }
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            { }
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

            { }
            <Route
              path="/order-returns"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <ReturnListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-returns/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <ReturnDetailPage />
                </ProtectedRoute>
              }
            />

            { }
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

            { }
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

            { }
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
            <Route
              path="/suppliers/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <SupplierDetail />
                </ProtectedRoute>
              }
            />

            { }
            <Route
              path="/categories"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <Categories />
                </ProtectedRoute>
              }
            />

            { }
            <Route
              path="/promotions"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <Promotions />
                </ProtectedRoute>
              }
            />

            { }
            <Route
              path="/products/:productId/reviews"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <ProductReviews />
                </ProtectedRoute>
              }
            />

            { }
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

            { }
            <Route
              path="/shipments/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]}>
                  <ShipmentDetail />
                </ProtectedRoute>
              }
            />

            { }
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

            { }
            <Route
              path="/finance"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <Finance />
                </ProtectedRoute>
              }
            />

            { }
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            { }
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            { }
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <ReturnSettingPage />
                </ProtectedRoute>
              }
            />

            { }
            <Route
              path="/invoices/export"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <ExportInvoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/import"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <ImportInvoices />
                </ProtectedRoute>
              }
            />

            { }
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
      <FloatingChatButton />
    </Layout>
  );
}

export default App;
