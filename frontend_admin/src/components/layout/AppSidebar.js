import React, { useState, useMemo } from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
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
  FolderOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { USER_ROLES } from "../../constants/roles";

const { Sider } = Layout;

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth?.user);
  const userRole = user?.role;

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    const allMenuItems = [
      {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE, USER_ROLES.CUSTOMER], // All roles
      },
      {
        key: "/orders",
        icon: <ShoppingCartOutlined />,
        label: "Quản lý Đơn hàng",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE],
      },
      {
        key: "/products",
        icon: <AppstoreOutlined />,
        label: "Quản lý Sản phẩm",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE],
      },
      {
        key: "/categories",
        icon: <FolderOutlined />,
        label: "Quản lý Danh mục",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE],
      },
      {
        key: "/customers",
        icon: <UserOutlined />,
        label: "Quản lý Khách hàng",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE],
      },
      {
        key: "/users",
        icon: <UserSwitchOutlined />,
        label: "Quản lý Người dùng",
        roles: [USER_ROLES.ADMIN],
      },
      {
        key: "/inventory",
        icon: <InboxOutlined />,
        label: "Quản lý Kho",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE],
      },
      {
        key: "/import-orders",
        icon: <ImportOutlined />,
        label: "Đơn nhập hàng",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE],
      },
      {
        key: "/suppliers",
        icon: <InboxOutlined />,
        label: "Nhà cung cấp",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE],
      },
      {
        key: "/employees",
        icon: <TeamOutlined />,
        label: "Quản lý Nhân viên",
        roles: [USER_ROLES.ADMIN],
      },
      {
        key: "/finance",
        icon: <DollarOutlined />,
        label: "Quản lý Tài chính",
        roles: [USER_ROLES.ADMIN],
      },
      {
        key: "/reports",
        icon: <BarChartOutlined />,
        label: "Báo cáo",
        roles: [USER_ROLES.ADMIN],
      },
    ];

    // Filter menu items based on user role
    if (!userRole) return [];
    return allMenuItems.filter((item) => item.roles.includes(userRole));
  }, [userRole]);

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
