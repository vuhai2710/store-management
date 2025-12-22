import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Space,
  Modal,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ShopOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, clearError } from "../store/slices/authSlice";
import { authService } from "../services/authService";
import { USER_ROLES } from "../constants/roles";
import { APP_CONFIG } from "../constants";

const { Title, Text, Link } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordForm] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Đang đăng nhập với:", values);
      const result = await dispatch(login(values)).unwrap();
      console.log("Kết quả login:", result);

      const user = result?.user || authService.getUserFromStorage();
      console.log("User info:", user);

      if (user?.role === USER_ROLES.CUSTOMER) {

        message.success("Đăng nhập thành công! Đang chuyển hướng đến trang khách hàng...");

        const token = localStorage.getItem("token");
        const clientUrl = APP_CONFIG.CLIENT_URL;

        setTimeout(() => {

          window.location.href = `${clientUrl}?token=${token}`;
        }, 500);
        return;
      }

      message.success("Đăng nhập thành công!");
      if (user?.role === USER_ROLES.EMPLOYEE) {

        navigate("/orders");
      } else {

        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      message.error(error || "Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleForgotPassword = async (values) => {
    try {
      setForgotPasswordLoading(true);
      const response = await authService.forgotPassword(values.email);
      message.success(
        response?.message || "Vui lòng kiểm tra email để đặt lại mật khẩu!"
      );
      setForgotPasswordVisible(false);
      forgotPasswordForm.resetFields();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể gửi email. Vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
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
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Space direction="vertical" size="small">
            <ShopOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
            <Title level={2} style={{ margin: 0, color: "#262626" }}>
              Electronics Store
            </Title>
            <Text type="secondary">Hệ thống quản lý cửa hàng điện tử</Text>
          </Space>
        </div>

        {error && (
          <div
            style={{
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "16px",
              color: "#ff4d4f",
              fontSize: "14px",
            }}>
            {error}
            <Button
              type="link"
              size="small"
              onClick={handleClearError}
              style={{ padding: 0, marginLeft: "8px" }}>
              ✕
            </Button>
          </div>
        )}

        <Form name="login" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
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
              Đăng nhập
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              type="link"
              onClick={() => setForgotPasswordVisible(true)}
              style={{ padding: 0 }}>
              Quên mật khẩu?
            </Button>
          </Form.Item>
        </Form>
      </Card>

      { }
      <Modal
        title="Quên mật khẩu"
        open={forgotPasswordVisible}
        onCancel={() => {
          setForgotPasswordVisible(false);
          forgotPasswordForm.resetFields();
        }}
        footer={null}>
        <Form
          form={forgotPasswordForm}
          layout="vertical"
          onFinish={handleForgotPassword}
          autoComplete="off">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}>
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setForgotPasswordVisible(false);
                  forgotPasswordForm.resetFields();
                }}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={forgotPasswordLoading}>
                Gửi link đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
