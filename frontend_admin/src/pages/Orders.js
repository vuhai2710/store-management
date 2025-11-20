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
import { formatDate } from '../utils/formatUtils';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

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

  // Lấy ngày từ nhiều key (DTO dùng orderDate, phòng khi trả snake_case)
  const getOrderDateValue = (record) =>
    record?.orderDate ??
    record?.order_date ??
    record?.createdAt ??
    record?.created_at ??
    null;

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
      key: 'orderDate',
      width: 160,
      // dùng render để tự chọn field và format
      render: (_, record) => formatDate(getOrderDateValue(record), "DD/MM/YYYY HH:mm"),
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

  useEffect(() => {
    if (loading) {
      message.loading({ content: 'Đang tải dữ liệu...', key: 'fetchOrders' });
    } else {
      message.destroy('fetchOrders');
    }
  }, [loading]);

  return (
    <div className="page-orders">
      <div className="page-header">
        <Title level={3}>Quản lý đơn hàng</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateOrder}
        >
          Tạo đơn hàng
        </Button>
      </div>
      <Card>
        <div className="table-toolbar">
          <div className="filters">
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{ width: 150, marginRight: 8 }}
            >
              <Option value="">Tất cả</Option>
              {Object.keys(ORDER_STATUS).map((key) => (
                <Option key={key} value={key}>
                  <StatusBadge status={key} statusMap={ORDER_STATUS} />
                  {ORDER_STATUS[key].text}
                </Option>
              ))}
            </Select>
            <Input.Search
              placeholder="Tìm theo khách hàng"
              onSearch={handleCustomerIdFilter}
              style={{ width: 250 }}
              allowClear
            />
            <Button onClick={handleResetFilters} icon={<ReloadOutlined />}>
              Đặt lại bộ lọc
            </Button>
          </div>
          <div className="export-buttons">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
              style={{ marginRight: 8 }}
            >
              Xuất Excel
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              type="dashed"
            >
              Xuất CSV
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={orders}
          pagination={tablePagination}
          loading={loading}
          onChange={handleTableChange}
          rowKey={(record) => record.idOrder || record.id}
          scroll={{ x: 1300 }}
          locale={{ emptyText: <EmptyState /> }}
        />
      </Card>

      {/* Modal tạo đơn hàng - chỉ mở khi isModalVisible = true */}
      <Modal
        open={isModalVisible}
        title="Tạo đơn hàng"
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
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
