import React, { useEffect } from "react";
import { Form, Input, Button, Space, message, Row, Col, Select } from "antd";
import { useDispatch } from "react-redux";
import {
  createCustomer,
  updateCustomer,
} from "../../store/slices/customersSlice";

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
        customerType: customer.customerType || "REGULAR",
      });
    } else {
      // Set default value for new customer
      form.setFieldsValue({
        customerType: "REGULAR",
      });
    }
  }, [customer, form]);

  const handleSubmit = async (values) => {
    try {
      if (customer) {
        // Update existing customer
        await dispatch(
          updateCustomer({ id: customer.id, customerData: values })
        ).unwrap();
        message.success("Cập nhật khách hàng thành công!");
      } else {
        // Register new customer (requires username and password)
        await dispatch(createCustomer(values)).unwrap();
        message.success("Đăng ký khách hàng mới thành công!");
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error("Error saving customer:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu khách hàng");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {/* Username and Password - Only for new customer */}
      {!customer && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                {
                  min: 4,
                  message: "Tên đăng nhập phải có ít nhất 4 ký tự",
                },
              ]}>
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 4, message: "Mật khẩu phải có ít nhất 4 ký tự" },
              ]}>
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Form.Item
        name="name"
        label="Tên khách hàng"
        rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}>
        <Input placeholder="Nhập tên khách hàng" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
              {
                pattern: /^[A-Za-z0-9._%+-]+@gmail\.com$/,
                message: "Email phải có định dạng @gmail.com",
              },
            ]}
            tooltip={
              customer
                ? "Email không thể thay đổi"
                : "Email phải có định dạng @gmail.com"
            }>
            <Input placeholder="Nhập email" disabled={!!customer} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^0\d{9}$/,
                message: "Số điện thoại phải có 10 số và bắt đầu bằng 0",
              },
            ]}>
            <Input placeholder="Nhập số điện thoại" maxLength={10} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="address" label="Địa chỉ">
        <TextArea rows={3} placeholder="Nhập địa chỉ" />
      </Form.Item>

      {/* Only show customerType when editing */}
      {customer && (
        <Form.Item
          name="customerType"
          label="Loại khách hàng"
          rules={[
            { required: true, message: "Vui lòng chọn loại khách hàng" },
          ]}>
          <Select placeholder="Chọn loại khách hàng">
            <Option value="REGULAR">REGULAR</Option>
            <Option value="VIP">VIP</Option>
          </Select>
        </Form.Item>
      )}

      <div style={{ textAlign: "right", marginTop: "16px" }}>
        <Space>
          <Button onClick={() => onSuccess()}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {customer ? "Cập nhật" : "Đăng ký"} khách hàng
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default CustomerForm;
