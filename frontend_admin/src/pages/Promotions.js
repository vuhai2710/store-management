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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  fetchPromotions,
  fetchPromotionRules,
  deletePromotion,
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
              <Button type="primary" icon={<PlusOutlined />}>
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
              <Button type="primary" icon={<PlusOutlined />}>
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
    </div>
  );
};

export default Promotions;

