import React, { useEffect, useState } from "react";
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
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAdminReturnService } from "../../hooks/useAdminReturnService";
import { systemSettingService } from "../../services/systemSettingService";

const { Option } = Select;
const { Text } = Typography;

const ReturnListPage = () => {
  const { getReturns, updateReturnStatus, loading } = useAdminReturnService();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [typeFilter, setTypeFilter] = useState(undefined);
  const [searchOrderId, setSearchOrderId] = useState("");
  const navigate = useNavigate();

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

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      const response = await getReturns({
        pageNo: page,
        pageSize,
        status: statusFilter || undefined,
        returnType: typeFilter || undefined,
        orderId: searchOrderId || undefined,
      });
      console.log("Admin returns response:", response);
      setData(response.content || []);
      setPagination({
        current: response.pageNo || 1,
        pageSize: response.pageSize || 10,
        total: response.totalElements || 0,
      });
    } catch (error) {
      console.error("Error fetching returns:", error);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize);
  }, [statusFilter, typeFilter]);

  const handleTableChange = (paginationConfig) => {
    fetchData(paginationConfig.current, paginationConfig.pageSize);
  };

  const handleResetFilters = () => {
    setStatusFilter(undefined);
    setTypeFilter(undefined);
    setSearchOrderId("");
    fetchData(1, pagination.pageSize);
  };

  const handleSearch = () => {
    fetchData(1, pagination.pageSize);
  };

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
          fetchData(pagination.current, pagination.pageSize);
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
          fetchData(pagination.current, pagination.pageSize);
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
          fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error(error?.message || "Không thể hoàn thành yêu cầu");
        }
      },
    });
  };

  const columns = [
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
        let color = "default";
        let label = status;
        if (status === "REQUESTED") {
          color = "gold";
          label = "Chờ xử lý";
        }
        if (status === "APPROVED") {
          color = "blue";
          label = "Đã duyệt";
        }
        if (status === "COMPLETED") {
          color = "green";
          label = "Hoàn tất";
        }
        if (status === "REJECTED") {
          color = "red";
          label = "Từ chối";
        }
        if (status === "CANCELED") {
          color = "default";
          label = "Đã hủy";
        }
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
  ];

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
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Trạng thái"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: "100%" }}
            allowClear>
            <Option value="REQUESTED">Chờ xử lý</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Từ chối</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="CANCELED">Đã hủy</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Loại yêu cầu"
            value={typeFilter || undefined}
            onChange={setTypeFilter}
            style={{ width: "100%" }}
            allowClear>
            <Option value="RETURN">Trả hàng</Option>
            <Option value="EXCHANGE">Đổi hàng</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input.Search
            placeholder="Tìm theo mã đơn hàng"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            onSearch={handleSearch}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
            Đặt lại bộ lọc
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        rowKey="idReturn"
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
};

export default ReturnListPage;
