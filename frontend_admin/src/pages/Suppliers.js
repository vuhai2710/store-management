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
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliers, deleteSupplier } from '../store/slices/suppliersSlice';
import SupplierForm from '../components/suppliers/SupplierForm';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

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

  const handleExportExcel = () => {
    if (!filteredSuppliers || filteredSuppliers.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    try {
      exportToExcel(filteredSuppliers, `nha-cung-cap-${new Date().toISOString().split('T')[0]}`, columns);
      message.success('Xuất file Excel thành công!');
    } catch (error) {
      message.error(error?.message || 'Xuất file Excel thất bại!');
    }
  };

  const handleExportCSV = () => {
    if (!filteredSuppliers || filteredSuppliers.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    try {
      exportToCSV(filteredSuppliers, `nha-cung-cap-${new Date().toISOString().split('T')[0]}`, columns);
      message.success('Xuất file CSV thành công!');
    } catch (error) {
      message.error(error?.message || 'Xuất file CSV thất bại!');
    }
  };

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
            Quản lý nhà cung cấp
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản lý thông tin và danh sách nhà cung cấp của TechStore
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateSupplier}
          style={{
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Thêm nhà cung cấp
        </Button>
      </div>

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
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Space
            wrap
            style={{
              display: 'flex',
              gap: 8,
            }}
          >
            <Input.Search
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              style={{ width: 320, maxWidth: '100%' }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton={<SearchOutlined />}
            />
          </Space>
          <Space
            wrap
            style={{
              display: 'flex',
              gap: 8,
            }}
          >
            <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
              Xuất CSV
            </Button>
          </Space>
        </div>

        {loading && (!suppliers || suppliers.length === 0) ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredSuppliers}
            loading={loading}
            rowKey="idSupplier"
            pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
            locale={{
              emptyText: (
                <EmptyState
                  description="Chưa có nhà cung cấp nào"
                  actionText="Thêm nhà cung cấp"
                  showAction
                  onAction={handleCreateSupplier}
                />
              ),
            }}
            size="middle"
          />
        )}
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