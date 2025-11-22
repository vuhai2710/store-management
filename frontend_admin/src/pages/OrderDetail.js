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
import { createGHNShipmentForOrder } from '../store/slices/shipmentsSlice';
import { ordersService } from '../services/ordersService';
import { formatDate } from '../utils/formatUtils';

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
  const [creatingShipment, setCreatingShipment] = useState(false);

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

  const handleCreateGHNShipment = async () => {
    if (!orderId) return;
    try {
      setCreatingShipment(true);
      const shipment = await dispatch(createGHNShipmentForOrder(orderId)).unwrap();
      message.success('Tạo vận đơn GHN thành công!');
      const shipmentId = shipment?.idShipment;
      if (shipmentId) {
        navigate(`/shipments/${shipmentId}`);
      }
    } catch (error) {
      message.error(error || 'Tạo vận đơn GHN thất bại!');
    } finally {
      setCreatingShipment(false);
    }
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 260,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div style={{ padding: '8px 0' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/orders')}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        <Card
          style={{
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Text>Không tìm thấy đơn hàng</Text>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentOrder.status);
  const orderId = currentOrder.idOrder || currentOrder.id;

  // Get available status options based on current status & payment method
  const getAvailableStatuses = () => {
    const current = currentOrder.status?.toUpperCase();
    const paymentMethod = currentOrder.paymentMethod?.toUpperCase();

    if (current === 'PENDING') {
      // With CASH payments, allow going directly to COMPLETED (skip CONFIRMED)
      if (paymentMethod === 'CASH') {
        return ['COMPLETED', 'CANCELED'];
      }
      // Other methods keep the original flow: PENDING -> CONFIRMED / CANCELED
      return ['CONFIRMED', 'CANCELED'];
    }

    if (current === 'CONFIRMED') {
      return ['COMPLETED'];
    }

    return []; // COMPLETED and CANCELED cannot be changed
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <div style={{ padding: '8px 0' }}>
      <div
        className="page-header"
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Space align="center" style={{ gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/orders')}
          >
            Quay lại
          </Button>
          <div>
            <Title
              level={2}
              style={{
                marginBottom: 4,
                fontWeight: 700,
                color: '#0F172A',
              }}
            >
              Chi tiết đơn hàng #{orderId}
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Theo dõi trạng thái và chi tiết sản phẩm cho đơn hàng TechStore
            </Text>
          </div>
        </Space>
        <Space
          wrap
          style={{
            display: 'flex',
            gap: 8,
          }}
        >
          {availableStatuses.length > 0 && (
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              loading={statusUpdating}
              style={{ width: 200 }}
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
          {currentOrder.status === 'COMPLETED' && (
            <Button
              onClick={handleCreateGHNShipment}
              loading={creatingShipment}
            >
              Tạo vận đơn GHN
            </Button>
          )}
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrintInvoice}
          >
            In hóa đơn
          </Button>
        </Space>
      </div>

      <Card
        title="Thông tin đơn hàng"
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        }}
        bodyStyle={{ padding: 16 }}
      >
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
            {formatDate(currentOrder.orderDate, 'DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày giao hàng">
            {currentOrder.deliveredAt ? formatDate(currentOrder.deliveredAt, 'DD/MM/YYYY HH:mm:ss') : 'Chưa giao'}
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

      <Card
        title="Sản phẩm trong đơn hàng"
        style={{
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
          marginTop: 16,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Table
          columns={orderDetailsColumns}
          dataSource={currentOrder.orderDetails || currentOrder.items || []}
          rowKey={(record) => record.idOrderDetail || record.id}
          pagination={false}
          size="middle"
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


