import React from 'react';
import { List, Avatar, Tag, Typography, Space } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const { Text } = Typography;

const RecentOrders = () => {
  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'Nguyễn Văn A',
      amount: '2,500,000',
      status: 'completed',
      statusText: 'Hoàn thành',
      time: '2 giờ trước',
    },
    {
      id: 'ORD-002',
      customer: 'Trần Thị B',
      amount: '1,800,000',
      status: 'processing',
      statusText: 'Đang xử lý',
      time: '4 giờ trước',
    },
    {
      id: 'ORD-003',
      customer: 'Lê Văn C',
      amount: '3,200,000',
      status: 'pending',
      statusText: 'Chờ xác nhận',
      time: '6 giờ trước',
    },
    {
      id: 'ORD-004',
      customer: 'Phạm Thị D',
      amount: '950,000',
      status: 'completed',
      statusText: 'Hoàn thành',
      time: '8 giờ trước',
    },
    {
      id: 'ORD-005',
      customer: 'Hoàng Văn E',
      amount: '4,100,000',
      status: 'processing',
      statusText: 'Đang xử lý',
      time: '10 giờ trước',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <List
      dataSource={recentOrders}
      renderItem={(order) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar 
                icon={<ShoppingCartOutlined />} 
                style={{ backgroundColor: '#1890ff' }}
              />
            }
            title={
              <Space>
                <Text strong>{order.id}</Text>
                <Tag color={getStatusColor(order.status)}>
                  {order.statusText}
                </Tag>
              </Space>
            }
            description={
              <Space direction="vertical" size="small">
                <Text type="secondary">{order.customer}</Text>
                <Space>
                  <Text strong style={{ color: '#52c41a' }}>
                    {order.amount} VNĐ
                  </Text>
                  <Text type="secondary">{order.time}</Text>
                </Space>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default RecentOrders;


