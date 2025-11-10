import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Card,
  Typography,
  Modal,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, deleteOrder, setPagination, setFilters } from '../store/slices/ordersSlice';
import OrderForm from '../components/orders/OrderForm';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, pagination, filters } = useSelector((state) => state.orders);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchOrders({ ...pagination, ...filters }));
  }, [dispatch, pagination, filters]);

  const handleTableChange = (pagination, filters, sorter) => {
    dispatch(setPagination(pagination));
  };

  const handleSearch = (value) => {
    setSearchText(value);
    dispatch(setFilters({ search: value }));
  };

  const handleStatusFilter = (value) => {
    dispatch(setFilters({ status: value }));
  };

  const handleDateFilter = (dates) => {
    dispatch(setFilters({ 
      dateRange: dates ? [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] : null 
    }));
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setIsModalVisible(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setIsModalVisible(true);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };


  const handleDeleteOrder = async (orderId) => {
    try {
      await dispatch(deleteOrder(orderId)).unwrap();
      message.success('Xóa đơn hàng thành công!');
    } catch (error) {
      message.error('Xóa đơn hàng thất bại!');
    }
  };

  const handlePrintInvoice = (orderId) => {
    // Implement print invoice functionality
    message.info('Chức năng in hóa đơn đang được phát triển');
  };

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

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => customer?.name || 'N/A',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${amount?.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag color={method === 'cash' ? 'green' : 'blue'}>
          {method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Chờ xác nhận', value: 'pending' },
        { text: 'Đang xử lý', value: 'processing' },
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewOrder(record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditOrder(record)}
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đơn hàng này?"
            onConfirm={() => handleDeleteOrder(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Quản lý Đơn hàng</Title>
        <p>Quản lý và theo dõi tất cả đơn hàng trong hệ thống</p>
      </div>

      <Card className="table-container">
        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Input.Search
              placeholder="Tìm kiếm đơn hàng..."
              style={{ width: 300 }}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              allowClear
              onChange={handleStatusFilter}
            >
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={handleDateFilter}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateOrder}
            >
              Tạo đơn hàng mới
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Order Form Modal */}
      <Modal
        title={editingOrder ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <OrderForm
          order={editingOrder}
          onSuccess={() => {
            setIsModalVisible(false);
            dispatch(fetchOrders({ ...pagination, ...filters }));
          }}
        />
      </Modal>
    </div>
  );
};

export default Orders;
