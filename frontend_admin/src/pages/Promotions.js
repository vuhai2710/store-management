import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Modal,
  message,
  Popconfirm,
  Tag,
  Tabs,
  Row,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  fetchPromotions,
  fetchPromotionRules,
  createPromotion,
  updatePromotion,
  createPromotionRule,
  updatePromotionRule,
  deletePromotion,
  deletePromotionRule,
} from "../store/slices/promotionsSlice";
import { usePagination } from "../hooks/usePagination";
import { formatCurrency, formatDate } from "../utils/formatUtils";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Parse datetime từ backend (yyyy-MM-dd HH:mm:ss) sang dayjs object
 * Hỗ trợ nhiều format: backend format, ISO, DD/MM/YYYY...
 */
const parseDateFromBackend = (dateString) => {
  if (!dateString) return null;

  const formats = [
    "YYYY-MM-DD HH:mm:ss", // Backend format
    "YYYY-MM-DDTHH:mm:ss", // ISO format
    "YYYY-MM-DD",
    "DD/MM/YYYY HH:mm:ss",
    "DD/MM/YYYY HH:mm",
    "DD/MM/YYYY",
  ];

  // Thử parse với các format đã định nghĩa
  let parsed = dayjs(dateString, formats, true);

  // Nếu không parse được, thử với dayjs mặc định
  if (!parsed.isValid()) {
    parsed = dayjs(dateString);
  }

  return parsed.isValid() ? parsed : null;
};

const Promotions = () => {
  const dispatch = useDispatch();
  const { promotions, rules } = useSelector((state) => state.promotions || {});
  const [activeTab, setActiveTab] = useState("promotions");

  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [promoSubmitting, setPromoSubmitting] = useState(false);
  const [promoForm] = Form.useForm();

  const [isRuleModalVisible, setIsRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleSubmitting, setRuleSubmitting] = useState(false);
  const [ruleForm] = Form.useForm();

  // Pagination cho promotions
  const {
    currentPage: promoPage,
    pageSize: promoPageSize,
    setTotal: setPromoTotal,
    handlePageChange: handlePromoPageChange,
    pagination: promoPagination,
  } = usePagination(1, 10);

  // Pagination cho rules
  const {
    currentPage: rulePage,
    pageSize: rulePageSize,
    setTotal: setRuleTotal,
    handlePageChange: handleRulePageChange,
    pagination: rulePagination,
  } = usePagination(1, 10);

  const fetchPromotionsList = useCallback(() => {
    dispatch(
      fetchPromotions({
        pageNo: promoPage,
        pageSize: promoPageSize,
        sortBy: "createdAt",
        sortDirection: "DESC",
      })
    );
  }, [dispatch, promoPage, promoPageSize]);

  const fetchRulesList = useCallback(() => {
    dispatch(
      fetchPromotionRules({
        pageNo: rulePage,
        pageSize: rulePageSize,
        sortBy: "createdAt",
        sortDirection: "DESC",
      })
    );
  }, [dispatch, rulePage, rulePageSize]);

  useEffect(() => {
    if (activeTab === "promotions") {
      fetchPromotionsList();
    } else {
      fetchRulesList();
    }
  }, [activeTab, fetchPromotionsList, fetchRulesList]);

  useEffect(() => {
    if (promotions.pagination.totalElements) {
      setPromoTotal(promotions.pagination.totalElements);
    }
  }, [promotions.pagination.totalElements, setPromoTotal]);

  useEffect(() => {
    if (rules.pagination.totalElements) {
      setRuleTotal(rules.pagination.totalElements);
    }
  }, [rules.pagination.totalElements, setRuleTotal]);

  const handleDeletePromotion = async (id) => {
    try {
      await dispatch(deletePromotion(id)).unwrap();
      message.success("Xóa mã giảm giá thành công!");
      fetchPromotionsList();
    } catch (error) {
      message.error(error || "Xóa mã giảm giá thất bại!");
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await dispatch(deletePromotionRule(id)).unwrap();
      message.success("Xóa quy tắc giảm giá thành công!");
      fetchRulesList();
    } catch (error) {
      message.error(error || "Xóa quy tắc giảm giá thất bại!");
    }
  };

  const handleOpenCreatePromotion = () => {
    setEditingPromotion(null);
    promoForm.resetFields();
    promoForm.setFieldsValue({
      discountType: "PERCENTAGE",
      isActive: true,
    });
    setIsPromoModalVisible(true);
  };

  const handleOpenEditPromotion = (record) => {
    setEditingPromotion(record);

    const startDate = parseDateFromBackend(record.startDate);
    const endDate = parseDateFromBackend(record.endDate);

    promoForm.setFieldsValue({
      code: record.code,
      discountType: record.discountType,
      discountValue:
        record.discountValue != null ? Number(record.discountValue) : null,
      minOrderAmount:
        record.minOrderAmount != null ? Number(record.minOrderAmount) : null,
      usageLimit: record.usageLimit != null ? Number(record.usageLimit) : null,
      dateRange: startDate && endDate ? [startDate, endDate] : null,
      isActive: record.isActive !== undefined ? record.isActive : true,
    });
    setIsPromoModalVisible(true);
  };

  const handleSubmitPromotion = async (values) => {
    if (!values.dateRange || values.dateRange.length !== 2) {
      message.error("Vui lòng chọn thời gian áp dụng");
      return;
    }

    const payload = {
      code: values.code?.trim(),
      discountType: values.discountType,
      discountValue: values.discountValue,
      minOrderAmount: values.minOrderAmount != null ? values.minOrderAmount : 0,
      usageLimit:
        values.usageLimit != null && values.usageLimit !== ""
          ? values.usageLimit
          : null,
      startDate: values.dateRange[0]
        .startOf("day")
        .format("DD/MM/YYYY HH:mm:ss"),
      endDate: values.dateRange[1].endOf("day").format("DD/MM/YYYY HH:mm:ss"),
      isActive: values.isActive ?? true,
    };

    setPromoSubmitting(true);
    try {
      if (editingPromotion && editingPromotion.idPromotion) {
        await dispatch(
          updatePromotion({
            id: editingPromotion.idPromotion,
            promotionData: payload,
          })
        ).unwrap();
        message.success("Cập nhật mã giảm giá thành công!");
      } else {
        await dispatch(createPromotion(payload)).unwrap();
        message.success("Tạo mã giảm giá thành công!");
      }

      setIsPromoModalVisible(false);
      setEditingPromotion(null);
      promoForm.resetFields();
      fetchPromotionsList();
    } catch (error) {
      const errorMessage =
        error?.message || error || "Lưu mã giảm giá thất bại!";
      message.error(errorMessage);
    } finally {
      setPromoSubmitting(false);
    }
  };

  const handleOpenCreateRule = () => {
    setEditingRule(null);
    ruleForm.resetFields();
    ruleForm.setFieldsValue({
      discountType: "PERCENTAGE",
      customerType: "ALL",
      isActive: true,
    });
    setIsRuleModalVisible(true);
  };

  const handleOpenEditRule = (record) => {
    setEditingRule(record);

    const startDate = parseDateFromBackend(record.startDate);
    const endDate = parseDateFromBackend(record.endDate);

    ruleForm.setFieldsValue({
      ruleName: record.ruleName,
      discountType: record.discountType,
      discountValue:
        record.discountValue != null ? Number(record.discountValue) : null,
      minOrderAmount:
        record.minOrderAmount != null ? Number(record.minOrderAmount) : null,
      customerType: record.customerType || "ALL",
      priority: record.priority != null ? Number(record.priority) : 0,
      dateRange: startDate && endDate ? [startDate, endDate] : null,
      isActive: record.isActive !== undefined ? record.isActive : true,
    });
    setIsRuleModalVisible(true);
  };

  const handleSubmitRule = async (values) => {
    if (!values.dateRange || values.dateRange.length !== 2) {
      message.error("Vui lòng chọn thời gian áp dụng");
      return;
    }

    const payload = {
      ruleName: values.ruleName?.trim(),
      discountType: values.discountType,
      discountValue: values.discountValue,
      minOrderAmount: values.minOrderAmount != null ? values.minOrderAmount : 0,
      customerType: values.customerType || "ALL",
      startDate: values.dateRange[0]
        .startOf("day")
        .format("DD/MM/YYYY HH:mm:ss"),
      endDate: values.dateRange[1].endOf("day").format("DD/MM/YYYY HH:mm:ss"),
      isActive: values.isActive ?? true,
      priority:
        values.priority != null && values.priority !== "" ? values.priority : 0,
    };

    setRuleSubmitting(true);
    try {
      if (editingRule && editingRule.idRule) {
        await dispatch(
          updatePromotionRule({
            id: editingRule.idRule,
            ruleData: payload,
          })
        ).unwrap();
        message.success("Cập nhật quy tắc giảm giá thành công!");
      } else {
        await dispatch(createPromotionRule(payload)).unwrap();
        message.success("Tạo quy tắc giảm giá thành công!");
      }

      setIsRuleModalVisible(false);
      setEditingRule(null);
      ruleForm.resetFields();
      fetchRulesList();
    } catch (error) {
      const errorMessage =
        error?.message || error || "Lưu quy tắc giảm giá thất bại!";
      message.error(errorMessage);
    } finally {
      setRuleSubmitting(false);
    }
  };

  const promotionColumns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Loại giảm giá",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => (
        <Tag color={type === "PERCENTAGE" ? "green" : "orange"}>
          {type === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (value, record) =>
        record.discountType === "PERCENTAGE"
          ? `${value}%`
          : formatCurrency(value),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderAmount",
      key: "minOrderAmount",
      render: (value) => (value ? formatCurrency(value) : "Không"),
    },
    {
      title: "Số lần dùng",
      key: "usage",
      render: (record) => (
        <Text>
          {record.usageCount || 0} / {record.usageLimit || "∞"}
        </Text>
      ),
    },
    {
      title: "Thời gian",
      key: "dates",
      render: (record) => (
        <div>
          <div>Từ: {formatDate(record.startDate)}</div>
          <div>Đến: {formatDate(record.endDate)}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEditPromotion(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa mã giảm giá này?"
            onConfirm={() => handleDeletePromotion(record.idPromotion)}
            okText="Xóa"
            cancelText="Hủy">
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const ruleColumns = [
    {
      title: "Tên quy tắc",
      dataIndex: "ruleName",
      key: "ruleName",
    },
    {
      title: "Loại giảm giá",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => (
        <Tag color={type === "PERCENTAGE" ? "green" : "orange"}>
          {type === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (value, record) =>
        record.discountType === "PERCENTAGE"
          ? `${value}%`
          : formatCurrency(value),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderAmount",
      key: "minOrderAmount",
      render: (value) => (value ? formatCurrency(value) : "Không"),
    },
    {
      title: "Loại khách hàng",
      dataIndex: "customerType",
      key: "customerType",
      render: (type) => (
        <Tag
          color={
            type === "VIP" ? "gold" : type === "REGULAR" ? "blue" : "default"
          }>
          {type === "ALL" ? "Tất cả" : type === "VIP" ? "VIP" : "Thường"}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      key: "dates",
      render: (record) => (
        <div>
          <div>Từ: {formatDate(record.startDate)}</div>
          <div>Đến: {formatDate(record.endDate)}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEditRule(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa quy tắc này?"
            onConfirm={() => handleDeleteRule(record.idRule)}
            okText="Xóa"
            cancelText="Hủy">
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      <div
        className="page-header"
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 4,
              fontWeight: 700,
              color: "#0F172A",
            }}>
            Quản lý khuyến mãi & giảm giá
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Cấu hình mã giảm giá và quy tắc giảm giá tự động cho TechStore
          </Text>
        </div>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          background: "#FFFFFF",
        }}
        bodyStyle={{ padding: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Mã giảm giá" key="promotions">
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreatePromotion}>
                Thêm mã giảm giá
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchPromotionsList}>
                Làm mới
              </Button>
            </Space>

            {promotions.loading &&
            (!promotions.list || promotions.list.length === 0) ? (
              <LoadingSkeleton type="table" rows={5} />
            ) : promotions.list.length === 0 ? (
              <EmptyState description="Chưa có mã giảm giá nào" />
            ) : (
              <Table
                columns={promotionColumns}
                dataSource={promotions.list}
                rowKey="idPromotion"
                loading={promotions.loading}
                pagination={{
                  current: promoPagination.current,
                  pageSize: promoPagination.pageSize,
                  total: promoPagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  onChange: (page, size) => handlePromoPageChange(page, size),
                }}
                size="middle"
              />
            )}
          </TabPane>

          <TabPane tab="Quy tắc giảm giá tự động" key="rules">
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreateRule}>
                Thêm quy tắc
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchRulesList}>
                Làm mới
              </Button>
            </Space>

            {rules.loading && (!rules.list || rules.list.length === 0) ? (
              <LoadingSkeleton type="table" rows={5} />
            ) : rules.list.length === 0 ? (
              <EmptyState description="Chưa có quy tắc giảm giá nào" />
            ) : (
              <Table
                columns={ruleColumns}
                dataSource={rules.list}
                rowKey="idRule"
                loading={rules.loading}
                pagination={{
                  current: rulePagination.current,
                  pageSize: rulePagination.pageSize,
                  total: rulePagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  onChange: (page, size) => handleRulePageChange(page, size),
                }}
                size="middle"
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingPromotion ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"}
        open={isPromoModalVisible}
        onCancel={() => {
          setIsPromoModalVisible(false);
          setEditingPromotion(null);
          promoForm.resetFields();
        }}
        footer={null}
        destroyOnClose>
        <Form
          form={promoForm}
          layout="vertical"
          onFinish={handleSubmitPromotion}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã giảm giá"
                rules={[
                  { required: true, message: "Vui lòng nhập mã giảm giá" },
                  { max: 50, message: "Mã giảm giá không được quá 50 ký tự" },
                ]}>
                <Input placeholder="Nhập mã giảm giá (ví dụ: SPRING10)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Loại giảm giá"
                rules={[
                  { required: true, message: "Vui lòng chọn loại giảm giá" },
                ]}>
                <Select placeholder="Chọn loại giảm giá">
                  <Option value="PERCENTAGE">Phần trăm</Option>
                  <Option value="FIXED_AMOUNT">Số tiền cố định</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discountValue"
                label="Giá trị giảm"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị giảm" },
                  {
                    type: "number",
                    min: 0,
                    message: "Giá trị giảm phải lớn hơn hoặc bằng 0",
                  },
                ]}>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Nhập giá trị giảm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minOrderAmount" label="Đơn tối thiểu">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0 = không giới hạn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="usageLimit" label="Số lần sử dụng tối đa">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Để trống = không giới hạn"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Thời gian áp dụng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời gian áp dụng",
                  },
                ]}>
                <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsPromoModalVisible(false);
                  setEditingPromotion(null);
                  promoForm.resetFields();
                }}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={promoSubmitting}>
                {editingPromotion ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          editingRule ? "Chỉnh sửa quy tắc giảm giá" : "Thêm quy tắc giảm giá"
        }
        open={isRuleModalVisible}
        onCancel={() => {
          setIsRuleModalVisible(false);
          setEditingRule(null);
          ruleForm.resetFields();
        }}
        footer={null}
        destroyOnClose>
        <Form form={ruleForm} layout="vertical" onFinish={handleSubmitRule}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="ruleName"
                label="Tên quy tắc"
                rules={[
                  { required: true, message: "Vui lòng nhập tên quy tắc" },
                ]}>
                <Input placeholder="Nhập tên quy tắc" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Loại giảm giá"
                rules={[
                  { required: true, message: "Vui lòng chọn loại giảm giá" },
                ]}>
                <Select placeholder="Chọn loại giảm giá">
                  <Option value="PERCENTAGE">Phần trăm</Option>
                  <Option value="FIXED_AMOUNT">Số tiền cố định</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountValue"
                label="Giá trị giảm"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị giảm" },
                  {
                    type: "number",
                    min: 0,
                    message: "Giá trị giảm phải lớn hơn hoặc bằng 0",
                  },
                ]}>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Nhập giá trị giảm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="minOrderAmount" label="Đơn tối thiểu">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0 = không giới hạn"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerType" label="Loại khách hàng">
                <Select placeholder="Chọn loại khách hàng">
                  <Option value="ALL">Tất cả</Option>
                  <Option value="REGULAR">Thường</Option>
                  <Option value="VIP">VIP</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="Độ ưu tiên">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Số lớn hơn = ưu tiên cao hơn"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Thời gian áp dụng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời gian áp dụng",
                  },
                ]}>
                <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsRuleModalVisible(false);
                  setEditingRule(null);
                  ruleForm.resetFields();
                }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={ruleSubmitting}>
                {editingRule ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Promotions;
