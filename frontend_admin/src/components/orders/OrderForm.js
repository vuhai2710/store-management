import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  Table,
  InputNumber,
  Typography,
  message,
  Divider,
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, updateOrder } from '../../store/slices/ordersSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import { fetchCustomers } from '../../store/slices/customersSlice';

const { Option } = Select;
const { Text } = Typography;

const OrderForm = ({ order, onSuccess }) => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { customers } = useSelector((state) => state.customers);
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (order) {
      form.setFieldsValue({
        customerId: order.customerId,
        status: order.status,
        notes: order.notes,
      });
      setOrderItems(order.items || []);
    }
  }, [order, form]);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      message.warning('Vui lòng chọn sản phẩm và số lượng');
      return;
    }

    const existingItemIndex = orderItems.findIndex(
      item => item.productId === selectedProduct.id
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setOrderItems(updatedItems);
    } else {
      const newItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        quantity: quantity,
        total: selectedProduct.price * quantity,
      };
      setOrderItems([...orderItems, newItem]);
    }

    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveItem = (productId) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const updatedItems = orderItems.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQuantity,
          total: item.price * newQuantity,
        };
      }
      return item;
    });
    setOrderItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * 0.1; // 10% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleSubmit = async (values) => {
    if (orderItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    try {
      const orderData = {
        ...values,
        items: orderItems,
        subtotal: calculateSubtotal(),
        vat: calculateVAT(),
        totalAmount: calculateTotal(),
      };

      if (order) {
        await dispatch(updateOrder({ id: order.id, orderData })).unwrap();
        message.success('Cập nhật đơn hàng thành công!');
      } else {
        await dispatch(createOrder(orderData)).unwrap();
        message.success('Tạo đơn hàng thành công!');
      }

      onSuccess();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu đơn hàng');
    }
  };

  const itemColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.productId, value)}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `${total.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<MinusOutlined />}
          onClick={() => handleRemoveItem(record.productId)}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Card title="Thông tin đơn hàng" style={{ marginBottom: '16px' }}>
        <Form.Item
          name="customerId"
          label="Khách hàng"
          rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
        >
          <Select placeholder="Chọn khách hàng">
            {customers.map(customer => (
              <Option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="pending">Chờ xác nhận</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="paymentMethod"
          label="Phương thức thanh toán"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
        >
          <Select placeholder="Chọn phương thức thanh toán">
            <Option value="cash">Tiền mặt</Option>
            <Option value="bank_transfer">Chuyển khoản</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <Input.TextArea rows={3} placeholder="Ghi chú cho đơn hàng" />
        </Form.Item>
      </Card>

      <Card title="Sản phẩm trong đơn hàng">
        <Space style={{ marginBottom: '16px', width: '100%' }}>
          <Select
            placeholder="Chọn sản phẩm"
            style={{ width: 300 }}
            value={selectedProduct?.id}
            onChange={(value) => {
              const product = products.find(p => p.id === value);
              setSelectedProduct(product);
            }}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {products.map(product => (
              <Option key={product.id} value={product.id}>
                {product.name} - {product.price.toLocaleString('vi-VN')} VNĐ
              </Option>
            ))}
          </Select>
          <InputNumber
            min={1}
            value={quantity}
            onChange={setQuantity}
            placeholder="Số lượng"
            style={{ width: 120 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddItem}
          >
            Thêm
          </Button>
        </Space>

        <Table
          columns={itemColumns}
          dataSource={orderItems}
          rowKey="productId"
          pagination={false}
          size="small"
        />

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space direction="vertical" align="end">
            <Text>
              Tạm tính: {calculateSubtotal().toLocaleString('vi-VN')} VNĐ
            </Text>
            <Text>
              VAT (10%): {calculateVAT().toLocaleString('vi-VN')} VNĐ
            </Text>
            <Text strong style={{ fontSize: '18px' }}>
              Tổng tiền: {calculateTotal().toLocaleString('vi-VN')} VNĐ
            </Text>
          </Space>
        </div>
      </Card>

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <Space>
          <Button onClick={() => onSuccess()}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            {order ? 'Cập nhật' : 'Tạo'} đơn hàng
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default OrderForm;


