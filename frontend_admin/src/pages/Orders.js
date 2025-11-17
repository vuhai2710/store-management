import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Card,
  Typography,
  Modal,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, setPagination, setFilters } from '../store/slices/ordersSlice';
import OrderForm from '../components/orders/OrderForm';
import { usePagination } from '../hooks/usePagination';
import StatusBadge from '../components/common/StatusBadge';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const { Title, Text } = Typography;
const { Option } = Select;

// Order status mapping
const ORDER_STATUS = {
  PENDING: { text: 'Chờ xác nhận', color: 'warning' },
  CONFIRMED: { text: 'Đã xác nhận', color: 'processing' },
  COMPLETED: { text: 'Hoàn thành', color: 'success' },
  CANCELED: { text: 'Đã hủy', color: 'error' },
};

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, pagination, filters } = useSelector((state) => state.orders);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState(filters.status || null);
  const [customerIdFilter, setCustomerIdFilter] = useState(filters.customerId || null);

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    setTotal,
    handlePageChange,
    resetPagination,
    pagination: tablePagination,
  } = usePagination(1, 10);

  // Fetch orders when pagination or filters change
  const fetchOrdersList = useCallback(() => {
    const params = {
      pageNo: currentPage,
      pageSize,
      sortBy: 'orderDate',
      sortDirection: 'DESC',
    };

    if (statusFilter) params.status = statusFilter;
    if (customerIdFilter) params.customerId = customerIdFilter;

    dispatch(fetchOrders(params));
  }, [dispatch, currentPage, pageSize, statusFilter, customerIdFilter]);

  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

  // Sync total from Redux to hook
  useEffect(() => {
    setTotal(pagination.total || 0);
  }, [pagination.total, setTotal]);

  const handleTableChange = (p, _filters, sorter) => {
    handlePageChange(p.current, p.pageSize);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    dispatch(setFilters({ status: value }));
    resetPagination(); // Reset về page 1
  };

  const handleCustomerIdFilter = (value) => {
    setCustomerIdFilter(value);
    dispatch(setFilters({ customerId: value }));
    resetPagination(); // Reset về page 1
  };

  const handleResetFilters = () => {
    setStatusFilter(null);
    setCustomerIdFilter(null);
    dispatch(setFilters({ status: null, customerId: null }));
    resetPagination();
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setIsModalVisible(true);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handlePrintInvoice = async (orderId, e) => {
    e?.stopPropagation();
    try {
      const { ordersService } = await import('../services/ordersService');
      const blob = await ordersService.exportOrderToPdf(orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hoa-don-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Xuất hóa đơn thành công!');
    } catch (error) {
      message.error('Xuất hóa đơn thất bại!');
    }
  };

  const getStatusInfo = (status) => {
    if (!status) return { text: status, color: 'default' };
    const statusUpper = status.toUpperCase();
    return ORDER_STATUS[statusUpper] || { text: status, color: 'default' };
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'idOrder',
      key: 'idOrder',
      width: 100,
      render: (text) => <Text strong>#{text}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (record) => record.customerName || 'N/A',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      render: (amount) => (
        <Text strong>{amount ? `${Number(amount).toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}</Text>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method) => {
        if (!method) return <Tag>N/A</Tag>;
        const methodUpper = method.toUpperCase();
        if (methodUpper === 'CASH') {
          return <Tag color="green">Tiền mặt</Tag>;
        } else if (methodUpper === 'PAYOS') {
          return <Tag color="blue">PayOS</Tag>;
        } else if (methodUpper === 'TRANSFER') {
          return <Tag color="purple">Chuyển khoản</Tag>;
        } else if (methodUpper === 'ZALOPAY') {
          return <Tag color="orange">ZaloPay</Tag>;
        }
        return <Tag>{method}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => <StatusBadge status={status} statusMap={ORDER_STATUS} />,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 150,
      render: (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('vi-VN');
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        const orderId = record.idOrder || record.id;
        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewOrder(orderId)}
              />
            </Tooltip>
            <Tooltip title="In hóa đơn">
              <Button
                type="text"
                icon={<PrinterOutlined />}
                onClick={(e) => handlePrintInvoice(orderId, e)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handleExportExcel = () => {
    if (!orders || orders.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    try {
      exportToExcel(orders, `don-hang-${new Date().toISOString().split('T')[0]}`, columns);
      message.success('Xuất file Excel thành công!');
    } catch (error) {
      message.error(error?.message || 'Xuất file Excel thất bại!');
    }
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    try {
      exportToCSV(orders, `don-hang-${new Date().toISOString().split('T')[0]}`, columns);
      message.success('Xuất file CSV thành công!');
    } catch (error) {
      message.error(error?.message || 'Xuất file CSV thất bại!');
    }
  };

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
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: 180 }}
              allowClear
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELED">Đã hủy</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
            >
              Xóa lọc
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
            >
              Xuất CSV
            </Button>
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
        {loading && orders.length === 0 ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            rowKey={(record) => record.idOrder || record.id}
            pagination={{
              ...tablePagination,
              current: currentPage,
              pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} đơn hàng`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <EmptyState
                  description="Chưa có đơn hàng nào"
                  actionText="Tạo đơn hàng mới"
                  showAction
                  onAction={handleCreateOrder}
                />
              ),
            }}
          />
        )}
      </Card>

      {/* Order Form Modal */}
      <Modal
        title="Tạo đơn hàng mới"
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
            fetchOrdersList();
          }}
        />
      </Modal>
    </div>
  );
};

export default Orders;
