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
  GiftOutlined,
  RollbackOutlined,
  SettingOutlined,
  FileTextOutlined,
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
        key: "/order-returns",
        icon: <RollbackOutlined />,
        label: "Đơn Đổi/Trả hàng",
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
        key: "/promotions",
        icon: <GiftOutlined />,
        label: "Khuyến mãi & Giảm giá",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE],
      },
      {
        key: "invoices",
        icon: <FileTextOutlined />,
        label: "Quản lý Hóa đơn",
        roles: [USER_ROLES.ADMIN],
        children: [
          {
            key: "/invoices/export",
            label: "Hóa đơn xuất",
          },
          {
            key: "/invoices/import",
            label: "Hóa đơn nhập",
          },
        ],
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
        background: "#020617",
        minHeight: "100vh",
        borderRight: "1px solid #0B1120",
      }}>
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "0 12px" : "0 18px",
          color: "#E5E7EB",
          fontSize: collapsed ? 16 : 17,
          fontWeight: 700,
          borderBottom: "1px solid #111827",
          background:
            "linear-gradient(90deg, #020617 0%, #020617 40%, #111827 100%)",
        }}>
        <span>{collapsed ? "TS" : "TechStore"}</span>
        {!collapsed && (
          <span
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "#9CA3AF",
            }}>
            Admin
          </span>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: "#020617",
          border: "none",
        }}
      />
    </Sider>
  );
};

export default AppSidebar;
