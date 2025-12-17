import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Typography,
  Space,
  Spin,
  Alert,
  Divider,
  message,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  DollarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { systemSettingService } from "../../services/systemSettingService";

const { Title, Text, Paragraph } = Typography;

/**
 * Trang cài đặt đổi trả
 * Chỉ ADMIN mới có quyền truy cập
 *
 * Backend API:
 * - GET  /api/v1/settings/return-window
 * - PUT  /api/v1/settings/return-window?days=<number>
 */
const ReturnSettingPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentReturnDays, setCurrentReturnDays] = useState(7);
  const [currentAutoFreeShippingPromotion, setCurrentAutoFreeShippingPromotion] = useState("");
  const [error, setError] = useState(null);

  // Giá trị mặc định cho các field optional (chỉ hiển thị UI, không gửi API)
  const [refundDays, setRefundDays] = useState(7);
  const [exchangeSizeDays, setExchangeSizeDays] = useState(7);

  // Fetch current settings on mount
  const fetchCurrentSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const returnDays = await systemSettingService.getReturnWindow();
      const autoPromo = await systemSettingService.getAutoFreeShippingPromotion();
      setCurrentReturnDays(returnDays);
      setCurrentAutoFreeShippingPromotion(autoPromo || "");
      // Các field optional lấy giá trị theo return days làm mặc định
      setRefundDays(returnDays);
      setExchangeSizeDays(returnDays);
      form.setFieldsValue({
        returnWindowDays: returnDays,
        autoFreeShippingPromotion: autoPromo || "",
        refundWindowDays: returnDays,
        exchangeSizeWindowDays: returnDays,
      });
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError("Không thể tải cài đặt. Vui lòng thử lại.");
      message.error("Không thể tải cài đặt");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchCurrentSettings();
  }, [fetchCurrentSettings]);

  // Handle save - CHỈ gửi returnWindowDays lên backend
  const handleSave = async () => {
    try {
      const values = await form.validateFields(["returnWindowDays", "autoFreeShippingPromotion"]);
      const { returnWindowDays, autoFreeShippingPromotion } = values;

      if (!returnWindowDays || returnWindowDays < 1 || returnWindowDays > 365) {
        message.error("Số ngày đổi trả phải từ 1 đến 365");
        return;
      }

      setSaving(true);
      await systemSettingService.updateReturnWindow(returnWindowDays);
      await systemSettingService.updateAutoFreeShippingPromotion(autoFreeShippingPromotion);
      setCurrentReturnDays(returnWindowDays);
      setCurrentAutoFreeShippingPromotion(
        autoFreeShippingPromotion ? String(autoFreeShippingPromotion).trim() : ""
      );
      message.success("Cập nhật cài đặt đổi trả thành công!");
    } catch (err) {
      console.error("Failed to update return window setting:", err);
      if (err.errorFields) {
        // Form validation error
        return;
      }
      message.error(
        err.response?.data?.message ||
          "Không thể cập nhật cài đặt. Vui lòng thử lại."
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset form về giá trị ban đầu
  const handleReset = () => {
    form.setFieldsValue({
      returnWindowDays: currentReturnDays,
      autoFreeShippingPromotion: currentAutoFreeShippingPromotion,
      refundWindowDays: refundDays,
      exchangeSizeWindowDays: exchangeSizeDays,
    });
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    const returnDays = form.getFieldValue("returnWindowDays");
    return returnDays && returnDays >= 1 && returnDays <= 365;
  };

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <Title level={2}>
        <SettingOutlined /> Cài đặt đổi trả
      </Title>

      <Paragraph type="secondary">
        Quản lý thời gian cho phép khách hàng yêu cầu đổi/trả hàng sau khi nhận.
      </Paragraph>

      <Divider />

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Spin spinning={loading}>
        <Card>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              returnWindowDays: currentReturnDays,
              autoFreeShippingPromotion: currentAutoFreeShippingPromotion,
              refundWindowDays: refundDays,
              exchangeSizeWindowDays: exchangeSizeDays,
            }}
            onValuesChange={() => {
              // Force re-render để cập nhật trạng thái nút Lưu
              form.validateFields(["returnWindowDays"]).catch(() => {});
            }}>
            <Row gutter={[24, 16]}>
              <Col xs={24}>
                <Card
                  type="inner"
                  title={
                    <Space>
                      <SettingOutlined style={{ color: "#1890ff" }} />
                      <span>Mã freeship tự động (optional)</span>
                    </Space>
                  }
                  extra={
                    <Text type="secondary">
                      Hiện tại: <strong>{currentAutoFreeShippingPromotion || "(trống)"}</strong>
                    </Text>
                  }>
                  <Form.Item
                    name="autoFreeShippingPromotion"
                    label="Mã khuyến mãi freeship tự động"
                    extra="Để trống để tắt hiển thị freeship auto trên trang chủ.">
                    <Input
                      placeholder="VD: FREESHIP / 500.000đ / FS30K..."
                      allowClear
                      size="large"
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Số ngày đổi trả - BẮT BUỘC */}
              <Col xs={24}>
                <Card
                  type="inner"
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: "#1890ff" }} />
                      <span>Số ngày đổi trả</span>
                      <Text type="danger">*</Text>
                    </Space>
                  }
                  extra={
                    <Text type="secondary">
                      Hiện tại: <strong>{currentReturnDays} ngày</strong>
                    </Text>
                  }>
                  <Form.Item
                    name="returnWindowDays"
                    label="Số ngày cho phép đổi/trả hàng"
                    rules={[
                      { required: true, message: "Vui lòng nhập số ngày" },
                      {
                        type: "number",
                        min: 1,
                        max: 365,
                        message: "Số ngày phải từ 1 đến 365",
                      },
                    ]}
                    extra="Khách hàng chỉ có thể yêu cầu đổi/trả trong khoảng thời gian này sau khi nhận hàng.">
                    <InputNumber
                      min={1}
                      max={365}
                      style={{ width: "100%", maxWidth: 300 }}
                      placeholder="Nhập số ngày (1-365)"
                      addonAfter="ngày"
                      size="large"
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Số ngày hoàn tiền - OPTIONAL, chỉ hiển thị */}
              <Col xs={24} md={12}>
                <Card
                  type="inner"
                  title={
                    <Space>
                      <DollarOutlined style={{ color: "#52c41a" }} />
                      <span>Số ngày hoàn tiền</span>
                      <Tooltip title="Chỉ hiển thị tham khảo, không lưu vào hệ thống">
                        <InfoCircleOutlined style={{ color: "#999" }} />
                      </Tooltip>
                    </Space>
                  }>
                  <Form.Item
                    name="refundWindowDays"
                    label={
                      <Space>
                        <span>Số ngày cho phép hoàn tiền</span>
                        <Text type="secondary">(Tham khảo)</Text>
                      </Space>
                    }
                    extra="Giá trị này chỉ để tham khảo, không gửi lên server.">
                    <InputNumber
                      min={1}
                      max={365}
                      style={{ width: "100%" }}
                      placeholder="Nhập số ngày"
                      addonAfter="ngày"
                      disabled
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Số ngày đổi kích thước - OPTIONAL, chỉ hiển thị */}
              <Col xs={24} md={12}>
                <Card
                  type="inner"
                  title={
                    <Space>
                      <SwapOutlined style={{ color: "#faad14" }} />
                      <span>Số ngày đổi kích thước</span>
                      <Tooltip title="Chỉ hiển thị tham khảo, không lưu vào hệ thống">
                        <InfoCircleOutlined style={{ color: "#999" }} />
                      </Tooltip>
                    </Space>
                  }>
                  <Form.Item
                    name="exchangeSizeWindowDays"
                    label={
                      <Space>
                        <span>Số ngày cho phép đổi size</span>
                        <Text type="secondary">(Tham khảo)</Text>
                      </Space>
                    }
                    extra="Giá trị này chỉ để tham khảo, không gửi lên server.">
                    <InputNumber
                      min={1}
                      max={365}
                      style={{ width: "100%" }}
                      placeholder="Nhập số ngày"
                      addonAfter="ngày"
                      disabled
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Alert
              message="Lưu ý quan trọng"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>
                    Chỉ có <strong>"Số ngày đổi trả"</strong> được lưu vào hệ
                    thống.
                  </li>
                  <li>
                    Thay đổi sẽ áp dụng cho tất cả đơn hàng mới và hiện có.
                  </li>
                  <li>Giá trị khuyến nghị: 7-30 ngày.</li>
                </ul>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item>
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  size="large"
                  onClick={handleSave}
                  disabled={!isFormValid()}>
                  Lưu cài đặt
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  disabled={saving}
                  size="large">
                  Đặt lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default ReturnSettingPage;
