import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Select,
  Input,
  Row,
  Col,
  message,
  Modal,
  Typography,
  InputNumber,
  Divider,
  Empty,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  SaveOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAdminReturnService } from "../../hooks/useAdminReturnService";
import { systemSettingService } from "../../services/systemSettingService";
import { APP_CONFIG } from "../../constants";

const { Option } = Select;
const { Text } = Typography;

// Debounce hook for realtime search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Status options with labels
const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "REQUESTED", label: "Chờ xử lý" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELED", label: "Đã hủy" },
];

// Type options
const TYPE_OPTIONS = [
  { value: "ALL", label: "Tất cả loại" },
  { value: "RETURN", label: "Trả hàng" },
  { value: "EXCHANGE", label: "Đổi hàng" },
];

const ReturnListPage = () => {
  const { getReturns, updateReturnStatus, loading } = useAdminReturnService();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(APP_CONFIG.PAGE_SIZE);
  const [totalElements, setTotalElements] = useState(0);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [customerKeyword, setCustomerKeyword] = useState("");
  const navigate = useNavigate();

  // Use refs to store current filter values for fetchData
  const filtersRef = useRef({
    status: "ALL",
    type: "ALL",
    keyword: "",
    customerKeyword: "",
  });

  // Debounced search keywords for realtime search
  const debouncedKeyword = useDebounce(searchKeyword, 300);
  const debouncedCustomerKeyword = useDebounce(customerKeyword, 300);

  // Settings state
  const [returnWindowDays, setReturnWindowDays] = useState(7);
  const [savingSettings, setSavingSettings] = useState(false);

  // Load return window setting
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const days = await systemSettingService.getReturnWindow();
        setReturnWindowDays(days);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!returnWindowDays || returnWindowDays < 1) {
      message.error("Số ngày phải lớn hơn 0");
      return;
    }
    setSavingSettings(true);
    try {
      await systemSettingService.updateReturnWindow(returnWindowDays);
      message.success("Đã lưu cài đặt");
    } catch (error) {
      message.error("Không thể lưu cài đặt");
    } finally {
      setSavingSettings(false);
    }
  };

  // Fetch data function - uses refs for filters to avoid stale closures
  const fetchData = useCallback(
    async (page, size) => {
      try {
        const {
          status,
          type,
          keyword,
          customerKeyword: custKeyword,
        } = filtersRef.current;

        const params = {
          pageNo: page,
          pageSize: size,
        };

        // Only add status if not "ALL"
        if (status && status !== "ALL") {
          params.status = status;
        }

        // Only add returnType if not "ALL"
        if (type && type !== "ALL") {
          params.returnType = type;
        }

        // Add keyword for search (mã phiếu, mã đơn)
        if (keyword && keyword.trim()) {
          params.keyword = keyword.trim();
        }

        // Add customerKeyword for customer search (tên/id khách)
        if (custKeyword && custKeyword.trim()) {
          params.customerKeyword = custKeyword.trim();
        }

        console.log("Fetching returns with params:", params);
        const response = await getReturns(params);
        console.log("Admin returns response:", response);

        // Always set data from response, even if empty
        setData(response.content || []);
        setCurrentPage(response.pageNo || 1);
        setPageSize(response.pageSize || 10);
        setTotalElements(response.totalElements || 0);
      } catch (error) {
        console.error("Error fetching returns:", error);
        // On error, show empty data
        setData([]);
        setTotalElements(0);
      }
    },
    [getReturns]
  );

  // Update refs when filters change
  useEffect(() => {
    filtersRef.current = {
      status: statusFilter,
      type: typeFilter,
      keyword: debouncedKeyword,
      customerKeyword: debouncedCustomerKeyword,
    };
    // Reset to page 1 and fetch when filters change
    setCurrentPage(1);
    fetchData(1, pageSize);
  }, [statusFilter, typeFilter, debouncedKeyword, debouncedCustomerKeyword]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle table pagination change
  const handleTableChange = useCallback(
    (paginationConfig) => {
      const newPage = paginationConfig.current;
      const newPageSize = paginationConfig.pageSize;

      // If pageSize changed, update and fetch page 1
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize);
        setCurrentPage(1);
        fetchData(1, newPageSize);
        return;
      }

      // Just page change - fetch directly
      setCurrentPage(newPage);
      fetchData(newPage, newPageSize);
    },
    [fetchData, pageSize]
  );

  // Handle filter changes
  const handleStatusChange = useCallback((value) => {
    setStatusFilter(value);
  }, []);

  const handleTypeChange = useCallback((value) => {
    setTypeFilter(value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchKeyword(e.target.value);
  }, []);

  const handleCustomerSearchChange = useCallback((e) => {
    setCustomerKeyword(e.target.value);
  }, []);

  const handleResetFilters = useCallback(() => {
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setSearchKeyword("");
    setCustomerKeyword("");
  }, []);

  const handleApprove = async (record) => {
    Modal.confirm({
      title: "Duyệt yêu cầu đổi/trả",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      content: `Bạn có chắc muốn duyệt yêu cầu #${record.idReturn}?`,
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await updateReturnStatus(record.idReturn, "APPROVED");
          message.success("Đã duyệt yêu cầu thành công");
          fetchData(currentPage, pageSize);
        } catch (error) {
          message.error(error?.message || "Không thể duyệt yêu cầu");
        }
      },
    });
  };

  const handleReject = async (record) => {
    Modal.confirm({
      title: "Từ chối yêu cầu đổi/trả",
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc muốn từ chối yêu cầu #${record.idReturn}?`,
      okText: "Từ chối",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await updateReturnStatus(record.idReturn, "REJECTED");
          message.success("Đã từ chối yêu cầu");
          fetchData(currentPage, pageSize);
        } catch (error) {
          message.error(error?.message || "Không thể từ chối yêu cầu");
        }
      },
    });
  };

  const handleComplete = async (record) => {
    Modal.confirm({
      title: "Hoàn thành yêu cầu đổi/trả",
      icon: <ExclamationCircleOutlined style={{ color: "#1890ff" }} />,
      content: (
        <div>
          <p>Xác nhận hoàn thành yêu cầu #{record.idReturn}?</p>
          {record.returnType === "RETURN" && record.refundAmount && (
            <Text type="warning">
              Số tiền hoàn:{" "}
              {Number(record.refundAmount).toLocaleString("vi-VN")} VNĐ
            </Text>
          )}
        </div>
      ),
      okText: "Hoàn thành",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await updateReturnStatus(record.idReturn, "COMPLETED");
          message.success("Đã hoàn thành yêu cầu");
          fetchData(currentPage, pageSize);
        } catch (error) {
          message.error(error?.message || "Không thể hoàn thành yêu cầu");
        }
      },
    });
  };

  // Status color and label helper
  const getStatusDisplay = (status) => {
    const statusMap = {
      REQUESTED: { color: "gold", label: "Chờ xử lý" },
      APPROVED: { color: "blue", label: "Đã duyệt" },
      COMPLETED: { color: "green", label: "Hoàn tất" },
      REJECTED: { color: "red", label: "Từ chối" },
      CANCELED: { color: "default", label: "Đã hủy" },
    };
    return statusMap[status] || { color: "default", label: status };
  };

  const columns = useMemo(
    () => [
      {
        title: "Mã phiếu",
        dataIndex: "idReturn",
        key: "idReturn",
        render: (id) => <Text strong>#{id}</Text>,
      },
      {
        title: "Mã đơn hàng",
        dataIndex: "orderId",
        key: "orderId",
        render: (id) => <a onClick={() => navigate(`/orders/${id}`)}>#{id}</a>,
      },
      {
        title: "Khách hàng",
        dataIndex: "customerName",
        key: "customerName",
        render: (name, record) => (
          <span>
            {name || "N/A"}
            {record.customerId && (
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                ID: {record.customerId}
              </Text>
            )}
          </span>
        ),
      },
      {
        title: "Loại",
        dataIndex: "returnType",
        key: "returnType",
        render: (type) => (
          <Tag color={type === "RETURN" ? "blue" : "purple"}>
            {type === "RETURN" ? "Trả hàng" : "Đổi hàng"}
          </Tag>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          const { color, label } = getStatusDisplay(status);
          return <Tag color={color}>{label}</Tag>;
        },
      },
      {
        title: "Hoàn tiền",
        dataIndex: "refundAmount",
        key: "refundAmount",
        render: (amount) =>
          amount ? `${Number(amount).toLocaleString("vi-VN")} VNĐ` : "-",
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) => new Date(date).toLocaleString("vi-VN"),
      },
      {
        title: "Hành động",
        key: "action",
        width: 280,
        render: (_, record) => (
          <Space size="small" wrap>
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/order-returns/${record.idReturn}`)}>
              Xem
            </Button>
            {record.status === "REQUESTED" && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record)}>
                  Duyệt
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record)}>
                  Từ chối
                </Button>
              </>
            )}
            {record.status === "APPROVED" && (
              <Button
                type="primary"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                icon={<CheckCircleOutlined />}
                onClick={() => handleComplete(record)}>
                Hoàn thành
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [navigate]
  );

  // Custom empty component
  const emptyComponent = useMemo(
    () => (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            Không có yêu cầu đổi trả phù hợp
            {(statusFilter !== "ALL" ||
              typeFilter !== "ALL" ||
              searchKeyword ||
              customerKeyword) && (
              <Button type="link" onClick={handleResetFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </span>
        }
      />
    ),
    [
      statusFilter,
      typeFilter,
      searchKeyword,
      customerKeyword,
      handleResetFilters,
    ]
  );

  return (
    <Card title="Quản lý Đơn Đổi/Trả hàng">
      {/* Settings Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
        <Col>
          <Space>
            <SettingOutlined />
            <Text strong>Thời gian cho phép đổi/trả:</Text>
            <InputNumber
              min={1}
              max={365}
              value={returnWindowDays}
              onChange={setReturnWindowDays}
              addonAfter="ngày"
              style={{ width: 120 }}
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={savingSettings}
              onClick={handleSaveSettings}
              size="small">
              Lưu
            </Button>
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: "12px 0" }} />

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={handleStatusChange}
            style={{ width: "100%" }}>
            {STATUS_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Loại yêu cầu"
            value={typeFilter}
            onChange={handleTypeChange}
            style={{ width: "100%" }}>
            {TYPE_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Input
            placeholder="Tìm mã phiếu, mã đơn..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={handleSearchChange}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Input
            placeholder="Tìm tên/ID khách hàng..."
            prefix={<UserOutlined />}
            value={customerKeyword}
            onChange={handleCustomerSearchChange}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Button icon={<ReloadOutlined />} onClick={handleResetFilters} block>
            Đặt lại
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        rowKey="idReturn"
        dataSource={data}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalElements,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: APP_CONFIG.PAGE_SIZE_OPTIONS,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} yêu cầu`,
        }}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
        locale={{ emptyText: emptyComponent }}
      />
    </Card>
  );
};

export default ReturnListPage;
