import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Button, Space, Modal, Form, InputNumber, Select, Input, message } from 'antd';
import { InboxOutlined, WarningOutlined, CheckCircleOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory } from '../store/slices/inventorySlice';

const { Title } = Typography;
const { Option } = Select;

const Inventory = () => {
  const dispatch = useDispatch();
  const { inventory, loading } = useSelector((state) => state.inventory);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const handleImportStock = (product) => {
    setSelectedProduct(product);
    setIsImportModalVisible(true);
  };

  const handleImportSubmit = async (values) => {
    try {
      // Simulate API call
      message.success(`Đã nhập ${values.quantity} sản phẩm ${selectedProduct.productName}`);
      setIsImportModalVisible(false);
      form.resetFields();
      dispatch(fetchInventory());
    } catch (error) {
      message.error('Có lỗi xảy ra khi nhập hàng');
    }
  };

  const handleViewHistory = (product) => {
    setSelectedProduct(product);
    setIsHistoryModalVisible(true);
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Kho',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <Tag color={quantity > 10 ? 'success' : quantity > 0 ? 'warning' : 'error'}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'Giá trị tồn kho',
      dataIndex: 'value',
      key: 'value',
      render: (value) => `${value?.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleImportStock(record)}
          >
            Nhập hàng
          </Button>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record)}
          >
            Lịch sử
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Quản lý Kho hàng</Title>
        <p>Theo dõi tồn kho và quản lý kho hàng</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={inventory.length}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={inventory.filter(item => item.quantity < 10).length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Còn hàng"
              value={inventory.filter(item => item.quantity > 10).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={inventory}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Import Stock Modal */}
      <Modal
        title={`Nhập hàng - ${selectedProduct?.productName}`}
        open={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleImportSubmit}
        >
          <Form.Item
            name="quantity"
            label="Số lượng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Nhập số lượng"
            />
          </Form.Item>
          <Form.Item
            name="supplier"
            label="Nhà cung cấp"
          >
            <Select placeholder="Chọn nhà cung cấp">
              <Option value="apple">Apple Vietnam</Option>
              <Option value="samsung">Samsung Electronics</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Ghi chú về lần nhập hàng" />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsImportModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Nhập hàng
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* History Modal */}
      <Modal
        title={`Lịch sử nhập/xuất - ${selectedProduct?.productName}`}
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={[
            {
              title: 'Ngày',
              dataIndex: 'date',
              key: 'date',
            },
            {
              title: 'Loại',
              dataIndex: 'type',
              key: 'type',
              render: (type) => (
                <Tag color={type === 'import' ? 'green' : 'red'}>
                  {type === 'import' ? 'Nhập' : 'Xuất'}
                </Tag>
              ),
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              key: 'quantity',
            },
            {
              title: 'Ghi chú',
              dataIndex: 'notes',
              key: 'notes',
            },
          ]}
          dataSource={[
            {
              id: 1,
              date: '2024-01-15',
              type: 'import',
              quantity: 50,
              notes: 'Nhập từ Apple Vietnam',
            },
            {
              id: 2,
              date: '2024-01-10',
              type: 'export',
              quantity: 25,
              notes: 'Bán cho khách hàng',
            },
          ]}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default Inventory;
