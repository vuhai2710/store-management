import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  UserOutlined,
  InboxOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: "Quản lý Đơn hàng",
    },
    {
      key: "/products",
      icon: <AppstoreOutlined />,
      label: "Quản lý Sản phẩm",
    },
    {
      key: "/customers",
      icon: <UserOutlined />,
      label: "Quản lý Khách hàng",
    },
    {
      key: "/users",
      icon: <UserSwitchOutlined />,
      label: "Quản lý Người dùng",
    },
    {
      key: "/inventory",
      icon: <InboxOutlined />,
      label: "Quản lý Kho",
    },
    {
      key: "/suppliers",
      icon: <InboxOutlined />,
      label: "Nhà cung cấp",
    },
    {
      key: "/employees",
      icon: <TeamOutlined />,
      label: "Quản lý Nhân viên",
    },
    {
      key: "/finance",
      icon: <DollarOutlined />,
      label: "Quản lý Tài chính",
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === "/") return ["/dashboard"];
    return [path];
  };

  const getOpenKeys = () => {
    // Không cần open keys nữa vì đã bỏ submenu
    return [];
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{
        background: "#001529",
        minHeight: "100vh",
      }}>
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: collapsed ? "16px" : "18px",
          fontWeight: "bold",
          borderBottom: "1px solid #002140",
        }}>
        {collapsed ? "ERP" : "ERP Store"}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: "#001529",
          border: "none",
        }}
      />
    </Sider>
  );
};

export default AppSidebar;
