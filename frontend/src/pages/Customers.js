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
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCustomers, deleteCustomer, setPagination, setFilters } from '../store/slices/customersSlice';
import CustomerForm from '../components/customers/CustomerForm';

const { Title, Text } = Typography;
const { Option } = Select;

const Customers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers, loading, pagination, filters } = useSelector((state) => state.customers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchCustomers({ ...pagination, ...filters }));
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

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setIsModalVisible(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsModalVisible(true);
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await dispatch(deleteCustomer(customerId)).unwrap();
      message.success('Xóa khách hàng thành công!');
    } catch (error) {
      message.error('Xóa khách hàng thất bại!');
    }
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 60,
      render: (avatar, record) => (
        <Avatar 
          src={avatar} 
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        >
          {record.name?.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
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
      title: 'Loại khách hàng',
      dataIndex: 'customerType',
      key: 'customerType',
      render: (type) => (
        <Tag color={type === 'vip' ? 'gold' : 'blue'}>
          {type === 'vip' ? 'VIP' : 'Regular'}
        </Tag>
      ),
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
              onClick={() => handleViewCustomer(record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCustomer(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => handleDeleteCustomer(record.id)}
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
        <Title level={1}>Quản lý Khách hàng</Title>
        <p>Quản lý thông tin khách hàng và lịch sử mua hàng</p>
      </div>

      <Card className="table-container">
        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Input.Search
              placeholder="Tìm kiếm khách hàng..."
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
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
            <Select
              placeholder="Loại khách hàng"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => dispatch(setFilters({ customerType: value }))}
            >
              <Option value="regular">Regular</Option>
              <Option value="vip">VIP</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateCustomer}
            >
              Thêm khách hàng
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={customers}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} khách hàng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Customer Form Modal */}
      <Modal
        title={editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <CustomerForm
          customer={editingCustomer}
          onSuccess={() => {
            setIsModalVisible(false);
            dispatch(fetchCustomers({ ...pagination, ...filters }));
          }}
        />
      </Modal>
    </div>
  );
};

export default Customers;
