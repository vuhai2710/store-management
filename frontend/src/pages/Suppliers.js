import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Typography,
  Modal,
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliers, deleteSupplier } from '../store/slices/suppliersSlice';
import SupplierForm from '../components/suppliers/SupplierForm';

const { Title, Text } = Typography;

const Suppliers = () => {
  const dispatch = useDispatch();
  const { suppliers, loading } = useSelector((state) => state.suppliers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setIsModalVisible(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalVisible(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    try {
      await dispatch(deleteSupplier(supplierId)).unwrap();
      message.success('Xóa nhà cung cấp thành công!');
    } catch (error) {
      message.error('Xóa nhà cung cấp thất bại!');
    }
  };

  const handleCreateImportOrder = (supplier) => {
    // Navigate to import order creation
    message.info(`Tạo đơn nhập hàng từ ${supplier.name}`);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Tạo đơn nhập">
            <Button
              type="primary"
              size="small"
              icon={<ShoppingCartOutlined />}
              onClick={() => handleCreateImportOrder(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditSupplier(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
            onConfirm={() => handleDeleteSupplier(record.id)}
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

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalImportValue = 1500000000; // Mock data

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Quản lý Nhà cung cấp</Title>
        <p>Quản lý thông tin nhà cung cấp và đơn nhập hàng</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng nhà cung cấp"
              value={totalSuppliers}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Nhà cung cấp hoạt động"
              value={activeSuppliers}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng giá trị nhập hàng"
              value={totalImportValue}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
            />
          </Card>
        </Col>
      </Row>

      <Card className="table-container">
        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Input.Search
              placeholder="Tìm kiếm nhà cung cấp..."
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton={<SearchOutlined />}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateSupplier}
            >
              Thêm nhà cung cấp
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Supplier Form Modal */}
      <Modal
        title={editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <SupplierForm
          supplier={editingSupplier}
          onSuccess={() => {
            setIsModalVisible(false);
            dispatch(fetchSuppliers());
          }}
        />
      </Modal>
    </div>
  );
};

export default Suppliers;