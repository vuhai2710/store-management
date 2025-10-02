import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await dispatch(login(values)).unwrap();
      message.success('Đăng nhập thành công!');
    } catch (error) {
      message.error(error || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Space direction="vertical" size="small">
            <ShopOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <Title level={2} style={{ margin: 0, color: '#262626' }}>
              ERP Electronics Store
            </Title>
            <Text type="secondary">
              Hệ thống quản lý cửa hàng điện tử
            </Text>
          </Space>
        </div>

        {error && (
          <div style={{
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            color: '#ff4d4f',
            fontSize: '14px',
          }}>
            {error}
            <Button 
              type="link" 
              size="small" 
              onClick={handleClearError}
              style={{ padding: 0, marginLeft: '8px' }}
            >
              ✕
            </Button>
          </div>
        )}

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Demo Account: admin / admin123
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;


