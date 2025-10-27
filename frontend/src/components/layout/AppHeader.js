import React from 'react';
import { Layout, Avatar, Dropdown, Button, Space, Badge } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

const { Header } = Layout;

const AppHeader = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        <Badge count={5} size="small">
          <Button 
            type="text" 
            icon={<BellOutlined />} 
            size="large"
            style={{ color: '#666' }}
          />
        </Badge>
        
        <Badge count={3} size="small">
          <Button 
            type="text" 
            icon={<ShoppingCartOutlined />} 
            size="large"
            style={{ color: '#666' }}
          />
        </Badge>
        
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              src={user?.avatar}
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
