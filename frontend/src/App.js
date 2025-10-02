import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';

// Layout Components
import AppHeader from './components/layout/AppHeader';
import AppSidebar from './components/layout/AppSidebar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Finance from './pages/Finance';
import Reports from './pages/Reports';

const { Content } = Layout;

function App() {
  // Mock user data for demo - bypass authentication check
  const mockUser = {
    id: 1,
    username: 'admin',
    name: 'Administrator',
    email: 'admin@erp-electronics.com',
    role: 'admin',
    avatar: null,
  };

  // Always show the main app interface (bypass login check)
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar />
      <Layout>
        <AppHeader user={mockUser} />
        <Content>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Orders Routes */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            
            {/* Products Routes */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            {/* Customers Routes */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            
            {/* Inventory Routes */}
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            
            {/* Employees Routes */}
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            
            {/* Finance Routes */}
            <Route path="/finance" element={<Finance />} />
            <Route path="/reports" element={<Reports />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
