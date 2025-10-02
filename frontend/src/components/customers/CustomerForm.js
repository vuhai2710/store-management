import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Space,
  message,
  Row,
  Col,
  Select,
} from 'antd';
import { useDispatch } from 'react-redux';
import { createCustomer, updateCustomer } from '../../store/slices/customersSlice';

const { TextArea } = Input;
const { Option } = Select;

const CustomerForm = ({ customer, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    if (customer) {
      form.setFieldsValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        customerType: customer.customerType || 'regular',
      });
    }
  }, [customer, form]);

  const handleSubmit = async (values) => {
    try {
      if (customer) {
        await dispatch(updateCustomer({ id: customer.id, customerData: values })).unwrap();
        message.success('Cập nhật khách hàng thành công!');
      } else {
        await dispatch(createCustomer(values)).unwrap();
        message.success('Tạo khách hàng thành công!');
      }

      onSuccess();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu khách hàng');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="Tên khách hàng"
        rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
      >
        <Input placeholder="Nhập tên khách hàng" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address"
        label="Địa chỉ"
      >
        <TextArea rows={3} placeholder="Nhập địa chỉ" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="customerType"
            label="Loại khách hàng"
            rules={[{ required: true, message: 'Vui lòng chọn loại khách hàng' }]}
          >
            <Select placeholder="Chọn loại khách hàng">
              <Option value="regular">Regular</Option>
              <Option value="vip">VIP</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <Space>
          <Button onClick={() => onSuccess()}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            {customer ? 'Cập nhật' : 'Tạo'} khách hàng
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default CustomerForm;
