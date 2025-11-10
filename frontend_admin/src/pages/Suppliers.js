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
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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

  const handleDeleteSupplier = async (idSupplier) => {
    try {
      await dispatch(deleteSupplier(idSupplier)).unwrap();
      message.success('Xóa nhà cung cấp thành công!');
    } catch (error) {
      message.error(error || 'Xóa nhà cung cấp thất bại!');
    }
  };

  const filteredSuppliers = (suppliers || []).filter((s) => {
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.supplierName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.phoneNumber || '').toLowerCase().includes(q)
    );
  });

  const columns = [
    { title: 'ID', dataIndex: 'idSupplier', key: 'idSupplier', width: 80 },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text) => <Text strong>{text}</Text>,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEditSupplier(record)} />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
            onConfirm={() => handleDeleteSupplier(record.idSupplier)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Quản lý Nhà cung cấp</Title>
        <p>Quản lý thông tin nhà cung cấp</p>
      </div>

      <Card className="table-container">
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Input.Search
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              style={{ width: 320 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton={<SearchOutlined />}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSupplier}>
              Thêm nhà cung cấp
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          loading={loading}
          rowKey="idSupplier"
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
        />
      </Card>

      <Modal
        title={editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnHidden
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