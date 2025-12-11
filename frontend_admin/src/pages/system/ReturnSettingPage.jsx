import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
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
} from "antd";
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  StarOutlined,
  SwapOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { systemSettingService } from "../../services/systemSettingService";

const { Title, Text, Paragraph } = Typography;

/**
 * Trang quản lý cài đặt hệ thống
 * Chỉ ADMIN mới có quyền truy cập
 */
const SettingsPage = () => {
  const [returnForm] = Form.useForm();
  const [refundForm] = Form.useForm();
  const [exchangeSizeForm] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [savingReturn, setSavingReturn] = useState(false);
  const [savingRefund, setSavingRefund] = useState(false);
  const [savingExchangeSize, setSavingExchangeSize] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [currentReturnDays, setCurrentReturnDays] = useState(7);
  const [currentRefundDays, setCurrentRefundDays] = useState(7);
  const [currentExchangeSizeDays, setCurrentExchangeSizeDays] = useState(7);
  const [currentReviewHours, setCurrentReviewHours] = useState(24);
  const [error, setError] = useState(null);

  // Fetch current settings on mount
  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [returnDays, refundDays, exchangeSizeDays, reviewHours] =
        await Promise.all([
          systemSettingService.getReturnWindow().catch(() => 7),
          systemSettingService.getRefundWindow().catch(() => 7),
          systemSettingService.getExchangeSizeWindow().catch(() => 7),
          systemSettingService.getReviewEditWindow().catch(() => 24),
        ]);
      setCurrentReturnDays(returnDays);
      setCurrentRefundDays(refundDays);
      setCurrentExchangeSizeDays(exchangeSizeDays);
      setCurrentReviewHours(reviewHours);
      returnForm.setFieldsValue({ returnWindowDays: returnDays });
      refundForm.setFieldsValue({ refundWindowDays: refundDays });
      exchangeSizeForm.setFieldsValue({
        exchangeSizeWindowDays: exchangeSizeDays,
      });
      reviewForm.setFieldsValue({ reviewEditWindowHours: reviewHours });
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError("Không thể tải cài đặt. Vui lòng thử lại.");
      message.error("Không thể tải cài đặt");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReturn = async (values) => {
    const { returnWindowDays } = values;

    if (!returnWindowDays || returnWindowDays < 1) {
      message.error("Số ngày phải lớn hơn hoặc bằng 1");
      return;
    }

    setSavingReturn(true);
    try {
      await systemSettingService.updateReturnWindow(returnWindowDays);
      setCurrentReturnDays(returnWindowDays);
      message.success("Cập nhật cài đặt đổi/trả thành công!");
    } catch (err) {
      console.error("Failed to update return window setting:", err);
      message.error(
        err.response?.data?.message ||
          "Không thể cập nhật cài đặt. Vui lòng thử lại."
      );
    } finally {
      setSavingReturn(false);
    }
  };

  const handleSaveRefund = async (values) => {
    const { refundWindowDays } = values;

    if (!refundWindowDays || refundWindowDays < 1) {
      message.error("Số ngày phải lớn hơn hoặc bằng 1");
      return;
    }

    setSavingRefund(true);
    try {
      await systemSettingService.updateRefundWindow(refundWindowDays);
      setCurrentRefundDays(refundWindowDays);
      message.success("Cập nhật cài đặt hoàn tiền thành công!");
    } catch (err) {
      console.error("Failed to update refund window setting:", err);
      message.error(
        err.response?.data?.message ||
          "Không thể cập nhật cài đặt. Vui lòng thử lại."
      );
    } finally {
      setSavingRefund(false);
    }
  };

  const handleSaveExchangeSize = async (values) => {
    const { exchangeSizeWindowDays } = values;

    if (!exchangeSizeWindowDays || exchangeSizeWindowDays < 1) {
      message.error("Số ngày phải lớn hơn hoặc bằng 1");
      return;
    }

    setSavingExchangeSize(true);
    try {
      await systemSettingService.updateExchangeSizeWindow(
        exchangeSizeWindowDays
      );
      setCurrentExchangeSizeDays(exchangeSizeWindowDays);
      message.success("Cập nhật cài đặt đổi kích thước thành công!");
    } catch (err) {
      console.error("Failed to update exchange size window setting:", err);
      message.error(
        err.response?.data?.message ||
          "Không thể cập nhật cài đặt. Vui lòng thử lại."
      );
    } finally {
      setSavingExchangeSize(false);
    }
  };

  const handleSaveReview = async (values) => {
    const { reviewEditWindowHours } = values;

    if (!reviewEditWindowHours || reviewEditWindowHours < 1) {
      message.error("Số giờ phải lớn hơn hoặc bằng 1");
      return;
    }

    setSavingReview(true);
    try {
      await systemSettingService.updateReviewEditWindow(reviewEditWindowHours);
      setCurrentReviewHours(reviewEditWindowHours);
      message.success("Cập nhật cài đặt đánh giá thành công!");
    } catch (err) {
      console.error("Failed to update review edit window setting:", err);
      message.error(
        err.response?.data?.message ||
          "Không thể cập nhật cài đặt. Vui lòng thử lại."
      );
    } finally {
      setSavingReview(false);
    }
  };

  const handleResetReturn = () => {
    returnForm.setFieldsValue({ returnWindowDays: currentReturnDays });
  };

  const handleResetRefund = () => {
    refundForm.setFieldsValue({ refundWindowDays: currentRefundDays });
  };

  const handleResetExchangeSize = () => {
    exchangeSizeForm.setFieldsValue({
      exchangeSizeWindowDays: currentExchangeSizeDays,
    });
  };

  const handleResetReview = () => {
    reviewForm.setFieldsValue({ reviewEditWindowHours: currentReviewHours });
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2}>
        <SettingOutlined /> Cài đặt hệ thống
      </Title>

      <Paragraph type="secondary">
        Quản lý các cài đặt chung của hệ thống bao gồm thời gian đổi/trả hàng và
        thời gian chỉnh sửa đánh giá.
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
        <Row gutter={[24, 24]}>
          {/* Cài đặt đổi/trả hàng */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>Thời gian đổi/trả hàng</span>
                </Space>
              }
              extra={
                <Text type="secondary">
                  Hiện tại: <strong>{currentReturnDays} ngày</strong>
                </Text>
              }>
              <Form
                form={returnForm}
                layout="vertical"
                onFinish={handleSaveReturn}
                initialValues={{ returnWindowDays: currentReturnDays }}>
                <Form.Item
                  name="returnWindowDays"
                  label="Số ngày cho phép đổi/trả"
                  rules={[
                    { required: true, message: "Vui lòng nhập số ngày" },
                    {
                      type: "number",
                      min: 1,
                      message: "Số ngày phải lớn hơn hoặc bằng 1",
                    },
                  ]}
                  extra="Khách hàng chỉ có thể yêu cầu đổi/trả trong khoảng thời gian này sau khi nhận hàng.">
                  <InputNumber
                    min={1}
                    max={365}
                    style={{ width: "100%" }}
                    placeholder="Nhập số ngày"
                    addonAfter="ngày"
                    size="large"
                  />
                </Form.Item>

                <Alert
                  message="Lưu ý"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>
                        Thay đổi sẽ áp dụng cho tất cả đơn hàng mới và hiện có.
                      </li>
                      <li>Giá trị khuyến nghị: 7-30 ngày.</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={savingReturn}
                      size="large">
                      Lưu
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleResetReturn}
                      disabled={savingReturn}
                      size="large">
                      Đặt lại
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Cài đặt hoàn tiền */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  <span>Thời gian hoàn tiền</span>
                </Space>
              }
              extra={
                <Text type="secondary">
                  Hiện tại: <strong>{currentRefundDays} ngày</strong>
                </Text>
              }>
              <Form
                form={refundForm}
                layout="vertical"
                onFinish={handleSaveRefund}
                initialValues={{ refundWindowDays: currentRefundDays }}>
                <Form.Item
                  name="refundWindowDays"
                  label="Số ngày cho phép hoàn tiền"
                  rules={[
                    { required: true, message: "Vui lòng nhập số ngày" },
                    {
                      type: "number",
                      min: 1,
                      message: "Số ngày phải lớn hơn hoặc bằng 1",
                    },
                  ]}
                  extra="Khách hàng chỉ có thể yêu cầu hoàn tiền trong khoảng thời gian này sau khi nhận hàng.">
                  <InputNumber
                    min={1}
                    max={365}
                    style={{ width: "100%" }}
                    placeholder="Nhập số ngày"
                    addonAfter="ngày"
                    size="large"
                  />
                </Form.Item>

                <Alert
                  message="Lưu ý"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Thay đổi sẽ áp dụng cho tất cả đơn hàng mới.</li>
                      <li>Giá trị khuyến nghị: 7-14 ngày.</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={savingRefund}
                      size="large">
                      Lưu
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleResetRefund}
                      disabled={savingRefund}
                      size="large">
                      Đặt lại
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Cài đặt đổi kích thước */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <SwapOutlined />
                  <span>Thời gian đổi kích thước</span>
                </Space>
              }
              extra={
                <Text type="secondary">
                  Hiện tại: <strong>{currentExchangeSizeDays} ngày</strong>
                </Text>
              }>
              <Form
                form={exchangeSizeForm}
                layout="vertical"
                onFinish={handleSaveExchangeSize}
                initialValues={{
                  exchangeSizeWindowDays: currentExchangeSizeDays,
                }}>
                <Form.Item
                  name="exchangeSizeWindowDays"
                  label="Số ngày cho phép đổi kích thước"
                  rules={[
                    { required: true, message: "Vui lòng nhập số ngày" },
                    {
                      type: "number",
                      min: 1,
                      message: "Số ngày phải lớn hơn hoặc bằng 1",
                    },
                  ]}
                  extra="Khách hàng chỉ có thể yêu cầu đổi kích thước trong khoảng thời gian này sau khi nhận hàng.">
                  <InputNumber
                    min={1}
                    max={365}
                    style={{ width: "100%" }}
                    placeholder="Nhập số ngày"
                    addonAfter="ngày"
                    size="large"
                  />
                </Form.Item>

                <Alert
                  message="Lưu ý"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>
                        Áp dụng cho các sản phẩm có nhiều size như quần áo, giày
                        dép.
                      </li>
                      <li>Giá trị khuyến nghị: 7-15 ngày.</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={savingExchangeSize}
                      size="large">
                      Lưu
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleResetExchangeSize}
                      disabled={savingExchangeSize}
                      size="large">
                      Đặt lại
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Cài đặt thời gian sửa đánh giá */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <StarOutlined />
                  <span>Thời gian sửa đánh giá</span>
                </Space>
              }
              extra={
                <Text type="secondary">
                  Hiện tại: <strong>{currentReviewHours} giờ</strong>
                </Text>
              }>
              <Form
                form={reviewForm}
                layout="vertical"
                onFinish={handleSaveReview}
                initialValues={{ reviewEditWindowHours: currentReviewHours }}>
                <Form.Item
                  name="reviewEditWindowHours"
                  label="Số giờ cho phép sửa đánh giá"
                  rules={[
                    { required: true, message: "Vui lòng nhập số giờ" },
                    {
                      type: "number",
                      min: 1,
                      message: "Số giờ phải lớn hơn hoặc bằng 1",
                    },
                  ]}
                  extra="Khách hàng chỉ có thể chỉnh sửa đánh giá trong khoảng thời gian này sau khi tạo.">
                  <InputNumber
                    min={1}
                    max={720}
                    style={{ width: "100%" }}
                    placeholder="Nhập số giờ"
                    addonAfter="giờ"
                    size="large"
                  />
                </Form.Item>

                <Alert
                  message="Lưu ý"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>
                        Khách hàng chỉ được phép sửa đánh giá 1 lần duy nhất.
                      </li>
                      <li>Giá trị khuyến nghị: 24-72 giờ.</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={savingReview}
                      size="large">
                      Lưu
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleResetReview}
                      disabled={savingReview}
                      size="large">
                      Đặt lại
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default SettingsPage;
