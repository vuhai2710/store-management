import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const { Title, Text, Link } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Đang đăng ký với:", values);

      // Gọi API đăng ký - Backend cần customerName không phải fullName
      const response = await authService.register({
        username: values.username,
        password: values.password,
        email: values.email,
        customerName: values.fullName, // Backend expects customerName
        phoneNumber: values.phoneNumber,
        address: values.address || "", // Optional field
      });

      console.log("Kết quả đăng ký:", response);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");

      // Chuyển về trang login sau 1.5 giây
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      message.error(error.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}>
      <Card
        style={{
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Space direction="vertical" size="small">
            <ShopOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
            <Title level={2} style={{ margin: 0, color: "#262626" }}>
              Đăng ký tài khoản
            </Title>
            <Text type="secondary">Tạo tài khoản mới để sử dụng hệ thống</Text>
          </Space>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical">
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "Chỉ cho phép chữ, số và dấu gạch dưới!",
              },
            ]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="Họ và tên"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}>
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại phải có 10-11 chữ số!",
              },
            ]}>
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Số điện thoại"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ (không bắt buộc)">
            <Input.TextArea
              placeholder="Địa chỉ"
              rows={2}
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
              }}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            Đã có tài khoản?{" "}
            <Link
              onClick={() => navigate("/login")}
              style={{ fontWeight: "500" }}>
              Đăng nhập ngay
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
