import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  UserOutlined,
  InboxOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'Quản lý Đơn hàng',
      children: [
        {
          key: '/orders',
          label: 'Danh sách đơn hàng',
        },
        {
          key: '/orders/new',
          label: 'Tạo đơn hàng mới',
        },
      ],
    },
    {
      key: 'products',
      icon: <AppstoreOutlined />,
      label: 'Quản lý Sản phẩm',
      children: [
        {
          key: '/products',
          label: 'Danh sách sản phẩm',
        },
        {
          key: '/products/categories',
          label: 'Danh mục sản phẩm',
        },
      ],
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: 'Quản lý Khách hàng',
      children: [
        {
          key: '/customers',
          label: 'Danh sách khách hàng',
        },
        {
          key: '/customers/groups',
          label: 'Nhóm khách hàng',
        },
      ],
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: 'Quản lý Kho',
      children: [
        {
          key: '/inventory',
          label: 'Tồn kho',
        },
        {
          key: '/suppliers',
          label: 'Nhà cung cấp',
        },
        {
          key: '/warehouses',
          label: 'Kho hàng',
        },
      ],
    },
    {
      key: 'employees',
      icon: <TeamOutlined />,
      label: 'Quản lý Nhân viên',
      children: [
        {
          key: '/employees',
          label: 'Danh sách nhân viên',
        },
        {
          key: '/employees/departments',
          label: 'Phòng ban',
        },
        {
          key: '/employees/roles',
          label: 'Phân quyền',
        },
      ],
    },
    {
      key: 'finance',
      icon: <DollarOutlined />,
      label: 'Quản lý Tài chính',
      children: [
        {
          key: '/finance',
          label: 'Tài chính',
        },
        {
          key: '/finance/payroll',
          label: 'Quản lý lương',
        },
        {
          key: '/finance/reports',
          label: 'Báo cáo tài chính',
        },
      ],
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt hệ thống',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/') return ['/dashboard'];
    return [path];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys = [];
    
    if (path.startsWith('/orders')) openKeys.push('orders');
    if (path.startsWith('/products')) openKeys.push('products');
    if (path.startsWith('/customers')) openKeys.push('customers');
    if (path.startsWith('/inventory') || path.startsWith('/suppliers') || path.startsWith('/warehouses')) openKeys.push('inventory');
    if (path.startsWith('/employees')) openKeys.push('employees');
    if (path.startsWith('/finance')) openKeys.push('finance');
    
    return openKeys;
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{
        background: '#001529',
        minHeight: '100vh',
      }}
    >
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: collapsed ? '16px' : '18px',
        fontWeight: 'bold',
        borderBottom: '1px solid #002140',
      }}>
        {collapsed ? 'ERP' : 'ERP Store'}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: '#001529',
          border: 'none',
        }}
      />
    </Sider>
  );
};

export default AppSidebar;
