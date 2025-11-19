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
  InputNumber,
  DatePicker,
  Switch,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fetchPromotions,
  fetchPromotionRules,
  createPromotion,
  updatePromotion,
  deletePromotion,
  createPromotionRule,
  updatePromotionRule,
  deletePromotionRule,
} from "../store/slices/promotionsSlice";
import { usePagination } from "../hooks/usePagination";
import { formatCurrency, formatDate } from "../utils/formatUtils";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Promotions = () => {
  const dispatch = useDispatch();
  const { promotions, rules } = useSelector((state) => state.promotions || {});
  const [activeTab, setActiveTab] = useState("promotions");
  const [promoForm] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [editingRule, setEditingRule] = useState(null);

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

  // Promotion Modal handlers
  const showPromoModal = (promo = null) => {
    setEditingPromo(promo);
    if (promo) {
      promoForm.setFieldsValue({
        ...promo,
        startDate: dayjs(promo.startDate),
        endDate: dayjs(promo.endDate),
      });
    } else {
      promoForm.resetFields();
    }
    setPromoModalVisible(true);
  };

  const handlePromoSubmit = async () => {
    try {
      const values = await promoForm.validateFields();
      
      const formattedData = {
        code: values.code,
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        minOrderAmount: Number(values.minOrderAmount) || 0,
        usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
        startDate: values.startDate?.format("DD/MM/YYYY HH:mm:ss") || null,
        endDate: values.endDate?.format("DD/MM/YYYY HH:mm:ss") || null,
        isActive: values.isActive !== undefined ? values.isActive : true,
      };

      if (editingPromo) {
        await dispatch(updatePromotion({ id: editingPromo.idPromotion, promotionData: formattedData })).unwrap();
        message.success("Cập nhật mã giảm giá thành công!");
      } else {
        await dispatch(createPromotion(formattedData)).unwrap();
        message.success("Tạo mã giảm giá thành công!");
      }
      setPromoModalVisible(false);
      promoForm.resetFields();
      fetchPromotionsList();
    } catch (error) {
      console.error("Error submitting promotion:", error);
      if (error.errorFields) {
        message.error("Vui lòng kiểm tra lại thông tin!");
      } else {
        message.error(error?.message || error || "Thao tác thất bại!");
      }
    }
  };

  // Rule Modal handlers
  const showRuleModal = (rule = null) => {
    setEditingRule(rule);
    if (rule) {
      ruleForm.setFieldsValue({
        ...rule,
        startDate: dayjs(rule.startDate),
        endDate: dayjs(rule.endDate),
      });
    } else {
      ruleForm.resetFields();
    }
    setRuleModalVisible(true);
  };

  const handleRuleSubmit = async () => {
    try {
      const values = await ruleForm.validateFields();
      
      const formattedData = {
        ruleName: values.ruleName,
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        minOrderAmount: Number(values.minOrderAmount) || 0,
        customerType: values.customerType || "ALL",
        priority: Number(values.priority) || 0,
        startDate: values.startDate?.format("DD/MM/YYYY HH:mm:ss") || null,
        endDate: values.endDate?.format("DD/MM/YYYY HH:mm:ss") || null,
        isActive: values.isActive !== undefined ? values.isActive : true,
      };

      if (editingRule) {
        await dispatch(updatePromotionRule({ id: editingRule.idRule, ruleData: formattedData })).unwrap();
        message.success("Cập nhật quy tắc giảm giá thành công!");
      } else {
        await dispatch(createPromotionRule(formattedData)).unwrap();
        message.success("Tạo quy tắc giảm giá thành công!");
      }
      setRuleModalVisible(false);
      ruleForm.resetFields();
      fetchRulesList();
    } catch (error) {
      console.error("Error submitting rule:", error);
      if (error.errorFields) {
        message.error("Vui lòng kiểm tra lại thông tin!");
      } else {
        message.error(error?.message || error || "Thao tác thất bại!");
      }
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
        record.discountType === "PERCENTAGE" ? `${value}%` : formatCurrency(value),
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
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Hoạt động" : "Tạm dừng"}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => showPromoModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa mã giảm giá này?"
            onConfirm={() => handleDeletePromotion(record.idPromotion)}
            okText="Xóa"
            cancelText="Hủy"
          >
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
        record.discountType === "PERCENTAGE" ? `${value}%` : formatCurrency(value),
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
        <Tag color={type === "VIP" ? "gold" : type === "REGULAR" ? "blue" : "default"}>
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
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Hoạt động" : "Tạm dừng"}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => showRuleModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa quy tắc này?"
            onConfirm={() => handleDeleteRule(record.idRule)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <Title level={2}>Quản lý Khuyến mãi & Giảm giá</Title>
        <Text>Quản lý mã giảm giá và quy tắc giảm giá tự động</Text>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Mã giảm giá" key="promotions">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showPromoModal()}>
                Thêm mã giảm giá
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchPromotionsList}>
                Làm mới
              </Button>
            </Space>

            {promotions.loading && (!promotions.list || promotions.list.length === 0) ? (
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
              />
            )}
          </TabPane>

          <TabPane tab="Quy tắc giảm giá tự động" key="rules">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showRuleModal()}>
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
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal Promotion */}
      <Modal
        title={editingPromo ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"}
        open={promoModalVisible}
        onOk={handlePromoSubmit}
        onCancel={() => {
          setPromoModalVisible(false);
          promoForm.resetFields();
        }}
        width={700}
        okText={editingPromo ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form form={promoForm} layout="vertical" initialValues={{ isActive: true, discountType: "PERCENTAGE" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã giảm giá"
                name="code"
                rules={[{ required: true, message: "Vui lòng nhập mã giảm giá!" }]}
              >
                <Input placeholder="VD: PROMO2024" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Loại giảm giá"
                name="discountType"
                rules={[{ required: true, message: "Vui lòng chọn loại giảm giá!" }]}
              >
                <Select>
                  <Select.Option value="PERCENTAGE">Phần trăm (%)</Select.Option>
                  <Select.Option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.discountType !== currentValues.discountType}
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    label="Giá trị giảm"
                    name="discountValue"
                    rules={[{ required: true, message: "Vui lòng nhập giá trị giảm!" }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      max={getFieldValue("discountType") === "PERCENTAGE" ? 100 : undefined}
                      placeholder={getFieldValue("discountType") === "PERCENTAGE" ? "VD: 10" : "VD: 50000"}
                      addonAfter={getFieldValue("discountType") === "PERCENTAGE" ? "%" : "VNĐ"}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Đơn hàng tối thiểu" name="minOrderAmount">
                <InputNumber style={{ width: "100%" }} min={0} placeholder="0" addonAfter="VNĐ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giới hạn số lần sử dụng" name="usageLimit">
                <InputNumber style={{ width: "100%" }} min={1} placeholder="Không giới hạn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
              >
                <DatePicker showTime style={{ width: "100%" }} format="DD/MM/YYYY HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}
              >
                <DatePicker showTime style={{ width: "100%" }} format="DD/MM/YYYY HH:mm" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal Promotion Rule */}
      <Modal
        title={editingRule ? "Chỉnh sửa quy tắc giảm giá" : "Thêm quy tắc giảm giá"}
        open={ruleModalVisible}
        onOk={handleRuleSubmit}
        onCancel={() => {
          setRuleModalVisible(false);
          ruleForm.resetFields();
        }}
        width={700}
        okText={editingRule ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form
          form={ruleForm}
          layout="vertical"
          initialValues={{ isActive: true, discountType: "PERCENTAGE", customerType: "ALL", priority: 0 }}
        >
          <Form.Item
            label="Tên quy tắc"
            name="ruleName"
            rules={[{ required: true, message: "Vui lòng nhập tên quy tắc!" }]}
          >
            <Input placeholder="VD: Giảm 10% cho đơn > 500k" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại giảm giá"
                name="discountType"
                rules={[{ required: true, message: "Vui lòng chọn loại giảm giá!" }]}
              >
                <Select>
                  <Select.Option value="PERCENTAGE">Phần trăm (%)</Select.Option>
                  <Select.Option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.discountType !== currentValues.discountType}
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    label="Giá trị giảm"
                    name="discountValue"
                    rules={[{ required: true, message: "Vui lòng nhập giá trị giảm!" }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      max={getFieldValue("discountType") === "PERCENTAGE" ? 100 : undefined}
                      placeholder={getFieldValue("discountType") === "PERCENTAGE" ? "VD: 10" : "VD: 50000"}
                      addonAfter={getFieldValue("discountType") === "PERCENTAGE" ? "%" : "VNĐ"}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Đơn hàng tối thiểu" name="minOrderAmount">
                <InputNumber style={{ width: "100%" }} min={0} placeholder="0" addonAfter="VNĐ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Loại khách hàng"
                name="customerType"
                rules={[{ required: true, message: "Vui lòng chọn loại khách hàng!" }]}
              >
                <Select>
                  <Select.Option value="ALL">Tất cả</Select.Option>
                  <Select.Option value="VIP">VIP</Select.Option>
                  <Select.Option value="REGULAR">Thường</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Độ ưu tiên"
                name="priority"
                tooltip="Số càng cao càng được ưu tiên"
                rules={[{ required: true, message: "Vui lòng nhập độ ưu tiên!" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
              >
                <DatePicker showTime style={{ width: "100%" }} format="DD/MM/YYYY HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}
              >
                <DatePicker showTime style={{ width: "100%" }} format="DD/MM/YYYY HH:mm" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Promotions;

