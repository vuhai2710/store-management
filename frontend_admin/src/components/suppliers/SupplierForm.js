import React, { useEffect } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import { useDispatch } from 'react-redux';
import { createSupplier, updateSupplier } from '../../store/slices/suppliersSlice';

const { TextArea } = Input;

// Regex tương thích kiểu +84xxxxxxxxx hoặc 0xxxxxxxxx (10 số)
const PHONE_REGEX = /^(?:\+?84|0)\d{9}$/;

const SupplierForm = ({ supplier, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    if (supplier) {
      form.setFieldsValue({
        supplierName: supplier.supplierName,
        email: supplier.email,
        phoneNumber: supplier.phoneNumber,
        address: supplier.address,
      });
    } else {
      form.resetFields();
    }
  }, [supplier, form]);

  const handleSubmit = async (values) => {
    const payload = {
      supplierName: values.supplierName?.trim(),
      email: values.email?.trim() || null,
      phoneNumber: values.phoneNumber?.trim() || null,
      address: values.address?.trim() || null,
    };

    try {
      if (supplier?.idSupplier) {
        await dispatch(updateSupplier({ id: supplier.idSupplier, supplierData: payload })).unwrap();
        message.success('Cập nhật nhà cung cấp thành công!');
      } else {
        await dispatch(createSupplier(payload)).unwrap();
        message.success('Tạo nhà cung cấp thành công!');
      }
      onSuccess && onSuccess();
    } catch (e) {
      // Hiển thị lỗi field từ BE: e.errors = { field: message }
      const fieldErrors = e?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        form.setFields(
          Object.entries(fieldErrors).map(([name, errMsg]) => ({
            name,
            errors: [String(errMsg)],
          }))
        );
      }
      message.error(e?.message || 'Dữ liệu không hợp lệ');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="supplierName"
        label="Tên nhà cung cấp"
        rules={[
          { required: true, message: 'Vui lòng nhập tên nhà cung cấp' },
          { max: 255, message: 'Tối đa 255 ký tự' },
        ]}
      >
        <Input placeholder="Nhập tên nhà cung cấp" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { type: 'email', message: 'Email không hợp lệ' },
        ]}
      >
        <Input placeholder="Nhập email (không bắt buộc)" />
      </Form.Item>

      <Form.Item
        name="phoneNumber"
        label="Số điện thoại"
        rules={[
          {
            validator: (_, val) => {
              if (!val || PHONE_REGEX.test(val.trim())) return Promise.resolve();
              return Promise.reject(new Error('SĐT phải là 0xxxxxxxxx hoặc +84xxxxxxxxx (10 số)'));
            },
          },
          { max: 20, message: 'Tối đa 20 ký tự' },
        ]}
      >
        <Input placeholder="Nhập số điện thoại (không bắt buộc)" />
      </Form.Item>

      <Form.Item name="address" label="Địa chỉ">
        <TextArea rows={3} placeholder="Nhập địa chỉ (không bắt buộc)" />
      </Form.Item>

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Space>
          <Button onClick={() => onSuccess && onSuccess()}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {supplier?.idSupplier ? 'Cập nhật' : 'Tạo'} nhà cung cấp
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default SupplierForm;


