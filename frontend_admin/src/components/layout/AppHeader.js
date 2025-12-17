import React from "react";
import { Layout, Avatar, Dropdown, Space } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";

const { Header } = Layout;

const AppHeader = ({ user: userProp }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userFromRedux = useSelector((state) => state.auth?.user);
  const user = userProp || userFromRedux;

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleMenuClick = ({ key }) => {
    if (key === "profile") {
      navigate("/profile");
    } else if (key === "logout") {
      handleLogout();
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      // If avatarUrl is a full URL, return as is
      if (
        user.avatarUrl.startsWith("http://") ||
        user.avatarUrl.startsWith("https://")
      ) {
        return user.avatarUrl;
      }
      // Otherwise, prepend base URL
      return `${process.env.REACT_APP_API_URL || "http://localhost:8080"}${user.avatarUrl
        }`;
    }
    return null;
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        minHeight: 64,
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#0F172A",
        }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9999,
            backgroundColor: "#1D4ED8",
            border: "1px solid #BFDBFE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
          }}>
          TS
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: 32,
          }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 0.4,
              color: "#0F172A",
              marginBottom: 0,
              lineHeight: 1.1,
            }}>
            ElectronicStore Admin
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#64748B",
              marginTop: 0,
              lineHeight: 1.1,
            }}>
            Bảng điều khiển quản trị hệ thống
          </div>
        </div>
      </div>

      <Space size="middle" align="center">
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          arrow>
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={getAvatarUrl()}
              style={{ backgroundColor: "#2563EB" }}
            />
            <span
              style={{
                color: "#0F172A",
                fontSize: 13,
                fontWeight: 500,
              }}>
              {user?.name || user?.username || "Người dùng"}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
