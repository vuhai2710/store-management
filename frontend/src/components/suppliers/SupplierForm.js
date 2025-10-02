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
import { createSupplier, updateSupplier } from '../../store/slices/suppliersSlice';

const { TextArea } = Input;
const { Option } = Select;

const SupplierForm = ({ supplier, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    if (supplier) {
      form.setFieldsValue({
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        status: supplier.status,
      });
    }
  }, [supplier, form]);

  const handleSubmit = async (values) => {
    try {
      if (supplier) {
        await dispatch(updateSupplier({ id: supplier.id, supplierData: values })).unwrap();
        message.success('Cập nhật nhà cung cấp thành công!');
      } else {
        await dispatch(createSupplier(values)).unwrap();
        message.success('Tạo nhà cung cấp thành công!');
      }

      onSuccess();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu nhà cung cấp');
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
        label="Tên nhà cung cấp"
        rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
      >
        <Input placeholder="Nhập tên nhà cung cấp" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="contact"
            label="Người liên hệ"
            rules={[{ required: true, message: 'Vui lòng nhập tên người liên hệ' }]}
          >
            <Input placeholder="Nhập tên người liên hệ" />
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
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' }
        ]}
      >
        <Input placeholder="Nhập email" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
      >
        <TextArea rows={3} placeholder="Nhập địa chỉ" />
      </Form.Item>

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

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <Space>
          <Button onClick={() => onSuccess()}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            {supplier ? 'Cập nhật' : 'Tạo'} nhà cung cấp
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default SupplierForm;


