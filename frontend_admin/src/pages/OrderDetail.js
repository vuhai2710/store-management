import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Descriptions, Table, Tag, Space, Button } from 'antd';
import { PrinterOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../store/slices/ordersSlice';

const { Title } = Typography;

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

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

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const orderItemsColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `${total.toLocaleString('vi-VN')} VNĐ`,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentOrder) {
    return <div>Không tìm thấy đơn hàng</div>;
  }

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Chi tiết đơn hàng #{currentOrder.id}</Title>
        <Space>
          <Button icon={<EditOutlined />}>Chỉnh sửa</Button>
          <Button icon={<PrinterOutlined />}>In hóa đơn</Button>
        </Space>
      </div>

      <Card title="Thông tin đơn hàng" style={{ marginBottom: '16px' }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Mã đơn hàng">
            {currentOrder.id}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(currentOrder.status)}>
              {getStatusText(currentOrder.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {currentOrder.customer?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(currentOrder.createdAt).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <strong>{currentOrder.totalAmount?.toLocaleString('vi-VN')} VNĐ</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            {currentOrder.notes || 'Không có'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Sản phẩm trong đơn hàng">
        <Table
          columns={orderItemsColumns}
          dataSource={currentOrder.items || []}
          rowKey="productId"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default OrderDetail;


