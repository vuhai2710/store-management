import React, { useState, useEffect } from "react";
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
    Space,
    Result,
    Spin,
} from "antd";
import {
    LockOutlined,
    ShopOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";

const { Title, Text } = Typography;

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            message.error("Link đặt lại mật khẩu không hợp lệ");
            navigate("/login");
        }
    }, [token, navigate]);

    const onFinish = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setLoading(true);
        try {
            const response = await authService.resetPassword(
                token,
                values.newPassword,
                values.confirmPassword
            );
            message.success(response?.message || "Đặt lại mật khẩu thành công!");
            setSuccess(true);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Không thể đặt lại mật khẩu. Vui lòng thử lại!";
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return null;
    }

    if (success) {
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
                        maxWidth: 450,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        borderRadius: "12px",
                    }}>
                    <Result
                        icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                        title="Đặt lại mật khẩu thành công!"
                        subTitle="Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ."
                        extra={[
                            <Button
                                type="primary"
                                key="login"
                                size="large"
                                onClick={() => navigate("/login")}
                                style={{
                                    borderRadius: "8px",
                                    height: "48px",
                                    fontSize: "16px",
                                }}>
                                Đăng nhập
                            </Button>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

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
                    maxWidth: 450,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    borderRadius: "12px",
                }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <Space direction="vertical" size="small">
                        <ShopOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
                        <Title level={2} style={{ margin: 0, color: "#262626" }}>
                            Đặt lại mật khẩu
                        </Title>
                        <Text type="secondary">Nhập mật khẩu mới cho tài khoản của bạn</Text>
                    </Space>
                </div>

                <Form
                    form={form}
                    name="resetPassword"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                    layout="vertical">
                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                        ]}>
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu mới"
                            style={{ borderRadius: "8px" }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
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
                            placeholder="Nhập lại mật khẩu mới"
                            style={{ borderRadius: "8px" }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: "16px" }}>
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
                            Đặt lại mật khẩu
                        </Button>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
                        <Button
                            type="link"
                            onClick={() => navigate("/login")}
                            style={{ padding: 0 }}>
                            ← Quay lại đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ResetPassword;
