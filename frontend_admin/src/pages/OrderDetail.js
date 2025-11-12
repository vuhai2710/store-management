import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Descriptions,
  Table,
  Tag,
  Space,
  Button,
  Select,
  message,
  Spin,
  Modal,
} from 'antd';
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, updateOrderStatus } from '../store/slices/ordersSlice';
import { ordersService } from '../services/ordersService';

const { Title, Text } = Typography;
const { Option } = Select;

// Order status mapping
const ORDER_STATUS = {
  PENDING: { text: 'Chờ xác nhận', color: 'warning' },
  CONFIRMED: { text: 'Đã xác nhận', color: 'processing' },
  COMPLETED: { text: 'Hoàn thành', color: 'success' },
  CANCELED: { text: 'Đã hủy', color: 'error' },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector((state) => state.orders);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(Number(id)));
      // Note: Shipment is optional and may not exist for all orders
      // If needed, fetch shipment separately when order is confirmed
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentOrder?.status) {
      setSelectedStatus(currentOrder.status);
    }
  }, [currentOrder]);

  const getStatusInfo = (status) => {
    if (!status) return { text: status, color: 'default' };
    const statusUpper = status.toUpperCase();
    return ORDER_STATUS[statusUpper] || { text: status, color: 'default' };
  };

  const handleStatusChange = async (newStatus) => {
    if (!currentOrder || !id) return;

    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng từ "${getStatusInfo(currentOrder.status).text}" sang "${getStatusInfo(newStatus).text}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setStatusUpdating(true);
          await dispatch(updateOrderStatus({ id: Number(id), status: newStatus })).unwrap();
          message.success('Cập nhật trạng thái đơn hàng thành công!');
          setSelectedStatus(newStatus);
          // Refresh order data
          dispatch(fetchOrderById(Number(id)));
        } catch (error) {
          message.error(error || 'Cập nhật trạng thái đơn hàng thất bại!');
          setSelectedStatus(currentOrder.status); // Revert selection
        } finally {
          setStatusUpdating(false);
        }
      },
      onCancel: () => {
        setSelectedStatus(currentOrder.status); // Revert selection
      },
    });
  };

  const handlePrintInvoice = async () => {
    if (!id) return;
    try {
      const blob = await ordersService.exportOrderToPdf(Number(id));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hoa-don-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Xuất hóa đơn thành công!');
    } catch (error) {
      message.error('Xuất hóa đơn thất bại!');
    }
  };

  const orderDetailsColumns = [
    {
      title: 'Sản phẩm',
      key: 'productName',
      render: (record) => {
        // Use snapshot if available, otherwise use current product name
        return record.productNameSnapshot || record.productName || 'N/A';
      },
    },
    {
      title: 'Mã sản phẩm',
      key: 'productCode',
      render: (record) => {
        return record.productCodeSnapshot || record.productCode || 'N/A';
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price) => {
        if (!price) return 'N/A';
        return `${Number(price).toLocaleString('vi-VN')} VNĐ`;
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 150,
      render: (subtotal, record) => {
        // Calculate if not provided
        const total = subtotal || (record.price && record.quantity ? Number(record.price) * record.quantity : 0);
        return `${Number(total).toLocaleString('vi-VN')} VNĐ`;
      },
    },
  ];

  if (loading && !currentOrder) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/orders')}
          style={{ marginBottom: '16px' }}
        >
          Quay lại
        </Button>
        <Card>
          <Typography.Text>Không tìm thấy đơn hàng</Typography.Text>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentOrder.status);
  const orderId = currentOrder.idOrder || currentOrder.id;

  // Get available status options based on current status
  const getAvailableStatuses = () => {
    const current = currentOrder.status?.toUpperCase();
    if (current === 'PENDING') {
      return ['CONFIRMED', 'CANCELED'];
    } else if (current === 'CONFIRMED') {
      return ['COMPLETED'];
    }
    return []; // COMPLETED and CANCELED cannot be changed
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/orders')}
          >
            Quay lại
          </Button>
          <Title level={1} style={{ margin: 0 }}>
            Chi tiết đơn hàng #{orderId}
          </Title>
        </Space>
        <Space style={{ marginTop: '16px' }}>
          {availableStatuses.length > 0 && (
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              loading={statusUpdating}
              style={{ width: 180 }}
            >
              {availableStatuses.map((status) => {
                const info = getStatusInfo(status);
                return (
                  <Option key={status} value={status}>
                    {info.text}
                  </Option>
                );
              })}
            </Select>
          )}
          {/* Note: Shipment is optional and may not exist for all orders */}
          {/* If shipment exists, it will be shown in order details */}
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrintInvoice}
          >
            In hóa đơn
          </Button>
        </Space>
      </div>

      <Card title="Thông tin đơn hàng" style={{ marginBottom: '16px' }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Mã đơn hàng">
            <Text strong>#{orderId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {currentOrder.customerName || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {currentOrder.customerPhone || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng">
            {currentOrder.shippingAddressSnapshot || currentOrder.customerAddress || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Nhân viên">
            {currentOrder.employeeName || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày đặt hàng">
            {currentOrder.orderDate
              ? new Date(currentOrder.orderDate).toLocaleString('vi-VN')
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày giao hàng">
            {currentOrder.deliveredAt
              ? new Date(currentOrder.deliveredAt).toLocaleString('vi-VN')
              : 'Chưa giao'}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">
            {currentOrder.paymentMethod
              ? currentOrder.paymentMethod === 'CASH'
                ? 'Tiền mặt'
                : currentOrder.paymentMethod === 'PAYOS'
                ? 'PayOS'
                : currentOrder.paymentMethod === 'TRANSFER'
                ? 'Chuyển khoản'
                : currentOrder.paymentMethod === 'ZALOPAY'
                ? 'ZaloPay'
                : currentOrder.paymentMethod
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            {currentOrder.notes || 'Không có'}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền" span={2}>
            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
              {currentOrder.totalAmount
                ? `${Number(currentOrder.totalAmount).toLocaleString('vi-VN')} VNĐ`
                : '0 VNĐ'}
            </Text>
          </Descriptions.Item>
          {currentOrder.discount && Number(currentOrder.discount) > 0 && (
            <>
              <Descriptions.Item label="Giảm giá">
                <Text style={{ color: '#ff4d4f' }}>
                  -{Number(currentOrder.discount).toLocaleString('vi-VN')} VNĐ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thành tiền">
                <Text strong style={{ fontSize: '16px' }}>
                  {currentOrder.finalAmount
                    ? `${Number(currentOrder.finalAmount).toLocaleString('vi-VN')} VNĐ`
                    : currentOrder.totalAmount
                    ? `${Number(currentOrder.totalAmount).toLocaleString('vi-VN')} VNĐ`
                    : '0 VNĐ'}
                </Text>
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      <Card title="Sản phẩm trong đơn hàng">
        <Table
          columns={orderDetailsColumns}
          dataSource={currentOrder.orderDetails || currentOrder.items || []}
          rowKey={(record) => record.idOrderDetail || record.id}
          pagination={false}
        />
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Space>
            <Text>Tổng cộng:</Text>
            <Text strong style={{ fontSize: '18px' }}>
              {currentOrder.totalAmount
                ? `${Number(currentOrder.totalAmount).toLocaleString('vi-VN')} VNĐ`
                : '0 VNĐ'}
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetail;


