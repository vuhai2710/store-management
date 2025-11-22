import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  Input,
  message,
  DatePicker,
  Spin,
} from 'antd';
import {
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productsSlice';
import { inventoryTransactionService } from '../services/inventoryTransactionService';
import { usePagination } from '../hooks/usePagination';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Inventory = () => {
  const dispatch = useDispatch();
  const { list: products, loading: productsLoading, pagination: productsPagination } = useSelector(
    (state) => state.products || {}
  );
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  // Pagination for transactions
  const {
    currentPage,
    pageSize,
    setTotal,
    handlePageChange,
    resetPagination,
    pagination: tablePagination,
  } = usePagination(1, 10);

  // Fetch products
  useEffect(() => {
    dispatch(
      fetchProducts({
        pageNo: 1,
        pageSize: 1000, // Get all products for inventory view
        sortBy: 'idProduct',
        sortDirection: 'ASC',
      })
    );
  }, [dispatch]);

  // Fetch transactions for selected product
  const fetchTransactions = useCallback(
    async (productId, page = 1, size = 10) => {
      if (!productId) return;

      try {
        setTransactionsLoading(true);
        const params = {
          pageNo: page,
          pageSize: size,
          sortBy: 'transactionDate',
          sortDirection: 'DESC',
        };

        if (transactionTypeFilter) {
          params.transactionType = transactionTypeFilter;
        }

        if (dateRange && dateRange.length === 2) {
          // DatePicker returns dayjs objects in antd v5
          const startDate = dateRange[0];
          const endDate = dateRange[1];
          if (startDate && endDate) {
            // Use dayjs methods if available (antd v5 uses dayjs)
            try {
              params.startDate = startDate.startOf('day').toISOString();
              params.endDate = endDate.endOf('day').toISOString();
            } catch (e) {
              // Fallback to native Date
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              params.startDate = start.toISOString();
              params.endDate = end.toISOString();
            }
          }
        }

        const pageResponse = await inventoryTransactionService.getTransactionsByProduct(
          productId,
          params
        );

        if (pageResponse && pageResponse.content) {
          setTransactions(pageResponse.content || []);
          setTotal(pageResponse.totalElements || 0);
        } else {
          setTransactions([]);
          setTotal(0);
        }
      } catch (error) {
        message.error('Lỗi khi tải lịch sử nhập/xuất kho');
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [transactionTypeFilter, dateRange, setTotal]
  );

  const handleViewHistory = (product) => {
    setSelectedProduct(product);
    setIsHistoryModalVisible(true);
    resetPagination();
    // Fetch transactions for this product
    fetchTransactions(product.idProduct, 1, pageSize);
  };

  const handleTransactionTypeFilter = (value) => {
    setTransactionTypeFilter(value);
    if (selectedProduct) {
      resetPagination();
      fetchTransactions(selectedProduct.idProduct, 1, pageSize);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (selectedProduct) {
      resetPagination();
      fetchTransactions(selectedProduct.idProduct, 1, pageSize);
    }
  };

  const handleTransactionTableChange = (p) => {
    handlePageChange(p.current, p.pageSize);
    if (selectedProduct) {
      fetchTransactions(selectedProduct.idProduct, p.current, p.pageSize);
    }
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalVisible(false);
    setSelectedProduct(null);
    setTransactions([]);
    setTransactionTypeFilter(null);
    setDateRange(null);
  };

  // Calculate statistics
  const totalProducts = productsPagination?.totalElements || products?.length || 0;
  const lowStockProducts = products?.filter((p) => (p.stockQuantity || 0) < 10 && (p.stockQuantity || 0) > 0) || [];
  const outOfStockProducts = products?.filter((p) => (p.stockQuantity || 0) === 0) || [];
  const inStockProducts = products?.filter((p) => (p.stockQuantity || 0) >= 10) || [];

  const inventoryValue = products?.reduce((sum, p) => {
    const quantity = p.stockQuantity || 0;
    const price = p.price || 0;
    return sum + quantity * price;
  }, 0) || 0;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'idProduct',
      key: 'idProduct',
      width: 80,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.productCode && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Mã: {record.productCode}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 120,
      render: (quantity) => {
        const qty = quantity || 0;
        let color = 'success';
        if (qty === 0) color = 'error';
        else if (qty < 10) color = 'warning';

        return <Tag color={color}>{qty}</Tag>;
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => (price ? `${Number(price).toLocaleString('vi-VN')} VNĐ` : 'N/A'),
    },
    {
      title: 'Giá trị tồn kho',
      key: 'inventoryValue',
      width: 150,
      render: (_, record) => {
        const quantity = record.stockQuantity || 0;
        const price = record.price || 0;
        const value = quantity * price;
        return <Text strong>{value.toLocaleString('vi-VN')} VNĐ</Text>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        if (status === 'IN_STOCK') {
          return <Tag color="green">Còn hàng</Tag>;
        } else if (status === 'OUT_OF_STOCK') {
          return <Tag color="red">Hết hàng</Tag>;
        }
        return <Tag>{status}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          size="small"
          icon={<HistoryOutlined />}
          onClick={() => handleViewHistory(record)}
        >
          Lịch sử
        </Button>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Ngày giờ',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 180,
      render: (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('vi-VN');
      },
    },
    {
      title: 'Loại',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 100,
      render: (type) => {
        if (type === 'IN') {
          return <Tag color="green">Nhập</Tag>;
        } else if (type === 'OUT') {
          return <Tag color="red">Xuất</Tag>;
        }
        return <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity, record) => {
        const qty = quantity || 0;
        const color = record.transactionType === 'IN' ? 'green' : 'red';
        return <Tag color={color}>{qty > 0 ? `+${qty}` : qty}</Tag>;
      },
    },
    {
      title: 'Sản phẩm',
      key: 'productName',
      render: (record) => record.productName || 'N/A',
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: 'Loại tham chiếu',
      dataIndex: 'referenceType',
      key: 'referenceType',
      render: (type) => type || 'N/A',
    },
    {
      title: 'ID tham chiếu',
      dataIndex: 'referenceId',
      key: 'referenceId',
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (name) => name || 'N/A',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
  ];

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
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 4,
              fontWeight: 700,
              color: '#0F172A',
            }}
          >
            Quản lý kho hàng
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Theo dõi tồn kho và lịch sử nhập/xuất kho cho TechStore
          </Text>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Statistic
              title="Tổng sản phẩm"
              value={totalProducts}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Statistic
              title="Sắp hết hàng"
              value={lowStockProducts.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Statistic
              title="Hết hàng"
              value={outOfStockProducts.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#dc2626' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Statistic
              title="Còn hàng"
              value={inStockProducts.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#16a34a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Statistic
              title="Tổng giá trị tồn kho"
              value={inventoryValue.toLocaleString('vi-VN')}
              suffix="VNĐ"
              valueStyle={{ color: '#2563EB', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="table-container"
        style={{
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
          background: '#FFFFFF',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Table
          columns={columns}
          dataSource={products || []}
          loading={productsLoading}
          rowKey="idProduct"
          pagination={{
            current: 1,
            pageSize: 10,
            total: totalProducts,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sản phẩm`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* History Modal */}
      <Modal
        title={
          <div>
            <Text strong>Lịch sử nhập/xuất kho</Text>
            {selectedProduct && (
              <div>
                <Text type="secondary">Sản phẩm: {selectedProduct.productName}</Text>
              </div>
            )}
          </div>
        }
        open={isHistoryModalVisible}
        onCancel={handleCloseHistoryModal}
        footer={null}
        width={1200}
      >
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Space wrap style={{ display: 'flex', gap: 8 }}>
            <Select
              placeholder="Lọc theo loại"
              style={{ width: 160 }}
              allowClear
              value={transactionTypeFilter}
              onChange={handleTransactionTypeFilter}
            >
              <Option value="IN">Nhập kho</Option>
              <Option value="OUT">Xuất kho</Option>
            </Select>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setTransactionTypeFilter(null);
              setDateRange(null);
              if (selectedProduct) {
                resetPagination();
                fetchTransactions(selectedProduct.idProduct, 1, pageSize);
              }
            }}
          >
            Xóa lọc
          </Button>
        </div>
        <Table
          columns={transactionColumns}
          dataSource={transactions}
          loading={transactionsLoading}
          rowKey="idTransaction"
          pagination={{
            ...tablePagination,
            current: currentPage,
            pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
          onChange={handleTransactionTableChange}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Modal>
    </div>
  );
};

export default Inventory;
