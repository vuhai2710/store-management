import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Typography,
  Modal,
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Image,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, deleteProduct, setPagination, setFilters } from '../store/slices/productsSlice';
import ProductForm from '../components/products/ProductForm';

const { Title, Text } = Typography;
const { Option } = Select;

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, pagination, filters } = useSelector((state) => state.products);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    dispatch(fetchProducts({ ...pagination, ...filters }));
  }, [dispatch, pagination, filters]);

  const handleTableChange = (pagination, filters, sorter) => {
    dispatch(setPagination(pagination));
  };

  const handleSearch = (value) => {
    setSearchText(value);
    dispatch(setFilters({ search: value }));
  };

  const handleCategoryFilter = (value) => {
    dispatch(setFilters({ category: value }));
  };

  const handleStockFilter = (value) => {
    dispatch(setFilters({ stockStatus: value }));
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      message.success('Xóa sản phẩm thành công!');
    } catch (error) {
      message.error('Xóa sản phẩm thất bại!');
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'error', text: 'Hết hàng' };
    if (stock < 10) return { status: 'warning', text: 'Sắp hết hàng' };
    return { status: 'success', text: 'Còn hàng' };
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image) => (
        <Image
          width={50}
          height={50}
          src={image || '/placeholder-image.jpg'}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => {
        const status = getStockStatus(stock);
        return (
          <Space>
            <Text>{stock}</Text>
            <Tag color={status.status}>{status.text}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'active': { color: 'success', text: 'Đang bán' },
          'inactive': { color: 'default', text: 'Ngừng bán' },
          'out-of-stock': { color: 'error', text: 'Hết hàng' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
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
              onClick={() => handleViewProduct(record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record)}
            />
          </Tooltip>
          <Tooltip title="Upload hình ảnh">
            <Button
              type="text"
              icon={<UploadOutlined />}
              onClick={() => message.info('Chức năng upload hình ảnh đang được phát triển')}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record.id)}
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

  const ProductGridItem = ({ product }) => (
    <Card
      hoverable
      cover={
        <Image
          height={200}
          src={product.image || '/placeholder-image.jpg'}
          style={{ objectFit: 'cover' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      }
      actions={[
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewProduct(product.id)}
        />,
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEditProduct(product)}
        />,
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteProduct(product.id)}
        />,
      ]}
    >
      <Card.Meta
        title={product.name}
        description={
          <Space direction="vertical" size="small">
            <Text type="secondary">{product.sku}</Text>
            <Text strong style={{ color: '#52c41a' }}>
              {product.price.toLocaleString('vi-VN')} VNĐ
            </Text>
            <Space>
              <Tag color="blue">{product.category}</Tag>
              <Tag color={getStockStatus(product.stock).status}>
                {getStockStatus(product.stock).text}
              </Tag>
            </Space>
          </Space>
        }
      />
    </Card>
  );

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Quản lý Sản phẩm</Title>
        <p>Quản lý danh mục sản phẩm và thông tin chi tiết</p>
      </div>

      <Card className="table-container">
        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Input.Search
              placeholder="Tìm kiếm sản phẩm..."
              style={{ width: 300 }}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
            <Select
              placeholder="Danh mục"
              style={{ width: 150 }}
              allowClear
              onChange={handleCategoryFilter}
            >
              <Option value="smartphone">Điện thoại</Option>
              <Option value="laptop">Laptop</Option>
              <Option value="tablet">Máy tính bảng</Option>
              <Option value="accessories">Phụ kiện</Option>
            </Select>
            <Select
              placeholder="Tình trạng kho"
              style={{ width: 150 }}
              allowClear
              onChange={handleStockFilter}
            >
              <Option value="in-stock">Còn hàng</Option>
              <Option value="low-stock">Sắp hết hàng</Option>
              <Option value="out-of-stock">Hết hàng</Option>
            </Select>
            <Select
              placeholder="Trạng thái sản phẩm"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => dispatch(setFilters({ status: value }))}
            >
              <Option value="active">Đang bán</Option>
              <Option value="inactive">Ngừng bán</Option>
              <Option value="out-of-stock">Hết hàng</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateProduct}
            >
              Thêm sản phẩm
            </Button>
            <Button
              icon={viewMode === 'table' ? <FilterOutlined /> : <SearchOutlined />}
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            >
              {viewMode === 'table' ? 'Xem dạng lưới' : 'Xem dạng bảng'}
            </Button>
          </Space>
        </div>

        {/* Table/Grid */}
        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={products}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} sản phẩm`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {products.map(product => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <ProductGridItem product={product} />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Product Form Modal */}
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ProductForm
          product={editingProduct}
          onSuccess={() => {
            setIsModalVisible(false);
            dispatch(fetchProducts({ ...pagination, ...filters }));
          }}
        />
      </Modal>
    </div>
  );
};

export default Products;
