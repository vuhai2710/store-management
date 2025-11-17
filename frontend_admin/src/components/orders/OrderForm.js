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
import { createOrder } from '../../store/slices/ordersSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import { fetchCustomers } from '../../store/slices/customersSlice';

const { Option } = Select;
const { Text } = Typography;

const OrderForm = ({ order, onSuccess }) => {
  const dispatch = useDispatch();
  const { list: products, loading: productsLoading } = useSelector((state) => state.products || {});
  const { customers, loading: customersLoading } = useSelector((state) => state.customers || {});
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [createNewCustomer, setCreateNewCustomer] = useState(false);

  useEffect(() => {
    // Fetch products with pagination to get full list
    dispatch(fetchProducts({ pageNo: 1, pageSize: 1000, sortBy: "idProduct", sortDirection: "ASC" }));
    // Fetch customers with pagination
    dispatch(fetchCustomers({ pageNo: 1, pageSize: 100, sortBy: "idCustomer", sortDirection: "ASC" }));
  }, [dispatch]);

  useEffect(() => {
    if (order) {
      // Note: Backend doesn't support direct order update
      // This form is only for creating new orders
      // If order exists, we can pre-fill some fields for reference
      form.setFieldsValue({
        customerId: order.idCustomer || order.customerId,
        paymentMethod: order.paymentMethod,
        discount: order.discount || 0,
        notes: order.notes,
      });
      // Map orderDetails to orderItems format for display
      if (order.orderDetails && Array.isArray(order.orderDetails)) {
        const items = order.orderDetails.map(detail => ({
          productId: detail.idProduct || detail.productId,
          productName: detail.productNameSnapshot || detail.productName,
          price: detail.price || 0,
          quantity: detail.quantity || 0,
          total: (detail.price || 0) * (detail.quantity || 0),
        }));
        setOrderItems(items);
      } else {
        setOrderItems([]);
      }
    } else {
      // Reset form for new order
      form.resetFields();
      setOrderItems([]);
      setCreateNewCustomer(false);
    }
  }, [order, form]);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      message.warning('Vui lòng chọn sản phẩm và số lượng');
      return;
    }

    // Products from Redux have idProduct field
    const productId = selectedProduct.idProduct || selectedProduct.id;
    if (!productId) {
      message.error('Sản phẩm không hợp lệ');
      return;
    }

    const existingItemIndex = orderItems.findIndex(
      item => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setOrderItems(updatedItems);
    } else {
      const newItem = {
        productId: productId,
        productName: selectedProduct.productName || selectedProduct.name,
        price: selectedProduct.price || 0,
        quantity: quantity,
        total: (selectedProduct.price || 0) * quantity,
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
    return orderItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSubmit = async (values) => {
    if (orderItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    try {
      // Lấy thông tin khách hàng đã chọn (nếu là khách có sẵn)
      const selectedCustomer = values.customerId
        ? (customers || []).find(c => (c.idCustomer || c.id) === values.customerId)
        : null;

      // Chuẩn hóa snapshot tên/điện thoại/địa chỉ
      const customerNameSnapshot =
        values.customerName ||
        selectedCustomer?.customerName ||
        selectedCustomer?.name ||
        '';

      const customerPhoneSnapshot =
        values.customerPhone ||
        selectedCustomer?.phoneNumber ||
        selectedCustomer?.phone ||
        '';

      const customerAddressSnapshot =
        values.customerAddress ||
        selectedCustomer?.address ||
        selectedCustomer?.customerAddress ||
        '';

      if (!customerNameSnapshot) {
        message.error('Vui lòng chọn/nhập tên khách hàng.');
        return;
      }

      const orderData = {
        // Gửi cả customerId và snapshot để qua được validate backend
        ...(values.customerId ? { customerId: values.customerId } : {}),
        customerName: customerNameSnapshot,
        customerPhone: customerPhoneSnapshot,
        customerAddress: customerAddressSnapshot,

        // Order items: chỉ cần productId và quantity, backend tự tính tiền
        orderItems: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),

        paymentMethod: values.paymentMethod || 'CASH',
        discount: values.discount ? Number(values.discount) : 0,
        notes: values.notes || null,
      };

      await dispatch(createOrder(orderData)).unwrap();
      message.success('Tạo đơn hàng thành công!');
      onSuccess();
    } catch (error) {
      const errorMessage = error?.message || error?.errors || 'Có lỗi xảy ra khi tạo đơn hàng';
      message.error(errorMessage);
      console.error('Order creation error:', error);
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
        {/* Customer Selection: Existing or New */}
        <Form.Item
          name="customerType"
          label="Loại khách hàng"
          initialValue="existing"
        >
          <Select
            placeholder="Chọn loại khách hàng"
            onChange={(value) => setCreateNewCustomer(value === 'new')}
          >
            <Option value="existing">Khách hàng có sẵn</Option>
            <Option value="new">Khách hàng mới (walk-in)</Option>
          </Select>
        </Form.Item>

        {!createNewCustomer ? (
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: !createNewCustomer, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select 
              placeholder="Chọn khách hàng"
              loading={customersLoading}
              showSearch
              optionFilterProp="children"
            >
              {customers && customers.map(customer => (
                <Option key={customer.idCustomer || customer.id} value={customer.idCustomer || customer.id}>
                  {customer.customerName || customer.name} - {customer.phoneNumber || customer.phone}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <>
            <Form.Item
              name="customerName"
              label="Tên khách hàng"
              rules={[{ required: createNewCustomer, message: 'Vui lòng nhập tên khách hàng' }]}
            >
              <Input placeholder="Nhập tên khách hàng" />
            </Form.Item>
            <Form.Item
              name="customerPhone"
              label="Số điện thoại"
              rules={[
                { required: createNewCustomer, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ (10-11 chữ số, bắt đầu bằng 0)' }
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              name="customerAddress"
              label="Địa chỉ"
            >
              <Input.TextArea rows={2} placeholder="Nhập địa chỉ (tùy chọn)" />
            </Form.Item>
          </>
        )}

        {/* Status is automatically set to PENDING by backend when creating order */}
        {/* Status can only be updated via updateOrderStatus endpoint, not during creation */}

        <Form.Item
          name="paymentMethod"
          label="Phương thức thanh toán"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
          initialValue="CASH"
        >
          <Select placeholder="Chọn phương thức thanh toán">
            <Option value="CASH">Tiền mặt</Option>
            <Option value="TRANSFER">Chuyển khoản</Option>
            <Option value="ZALOPAY">ZaloPay</Option>
            <Option value="PAYOS">PayOS</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="discount"
          label="Giảm giá (VNĐ)"
          initialValue={0}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Nhập số tiền giảm giá"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
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
            value={selectedProduct?.idProduct || selectedProduct?.id}
            onChange={(value) => {
              // Products from Redux have idProduct field
              const product = products.find(p => (p.idProduct || p.id) === value);
              setSelectedProduct(product);
            }}
            loading={productsLoading}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {products && products.map(product => {
              const productId = product.idProduct || product.id;
              const productName = product.productName || product.name;
              const price = product.price || 0;
              return (
                <Option key={productId} value={productId}>
                  {productName} - {price.toLocaleString('vi-VN')} VNĐ
                </Option>
              );
            })}
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
            <Text type="secondary" style={{ fontSize: '12px' }}>
              (Backend sẽ tự tính tổng tiền sau khi tạo đơn)
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
            Tạo đơn hàng
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default OrderForm;


