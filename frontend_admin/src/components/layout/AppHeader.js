import React from 'react';
import { Layout, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import NotificationCenter from '../common/NotificationCenter';

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
    if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'settings') {
      // TODO: Navigate to settings page
    } else if (key === 'logout') {
      handleLogout();
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      // If avatarUrl is a full URL, return as is
      if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://')) {
        return user.avatarUrl;
      }
      // Otherwise, prepend base URL
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.avatarUrl}`;
    }
    return null;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
    },
  ];

  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      background: '#fff',
      padding: '0 24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
        ERP Electronics Store
      </div>
      
      <Space size="middle">
        <div style={{ position: 'relative' }}>
          <NotificationCenter />
        </div>
        
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              src={getAvatarUrl()}
            />
            <span style={{ color: '#666' }}>
              {user?.name || user?.username || 'Người dùng'}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
