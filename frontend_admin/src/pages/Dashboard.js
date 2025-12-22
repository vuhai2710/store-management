import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Skeleton,
  message,
  Empty,
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  ReloadOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import { USER_ROLES } from "../constants/roles";
import { dashboardService } from "../services/dashboardService";

const { Title, Text } = Typography;

const Dashboard = () => {
  const user = useSelector((state) => state.auth?.user);
  const userRole = user?.role;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0";
    const num = Number(value);
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString("vi-VN");
  };

  const formatFullCurrency = (value) => {
    if (value === null || value === undefined) return "0 VNĐ";
    return `${Number(value).toLocaleString("vi-VN")} VNĐ`;
  };

  const loadDashboard = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await dashboardService.getOverview(5, 10, 7);
      setData(response);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      message.error("Lỗi khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (userRole === USER_ROLES.ADMIN) {
      loadDashboard();
    }
  }, [loadDashboard, userRole]);

  const handleRefresh = () => {
    if (userRole === USER_ROLES.ADMIN) {
      loadDashboard(true);
    }
  };

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: "4px 0 0", color: "#2563EB" }}>
            Doanh thu thuần: {formatFullCurrency(payload[0].value)}
          </p>
          {payload[0].payload.orderCount && (
            <p style={{ margin: "4px 0 0", color: "#64748B" }}>
              Đơn hàng: {payload[0].payload.orderCount}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const topProductsColumns = [
    {
      title: "#",
      key: "rank",
      width: 40,
      render: (_, __, index) => (
        <span
          style={{
            fontWeight: 600,
            color: index < 3 ? "#f59e0b" : "#64748B",
          }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
      render: (text) => (
        <Text ellipsis style={{ maxWidth: 180 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "SL bán",
      dataIndex: "quantitySold",
      key: "quantitySold",
      align: "right",
      width: 80,
      render: (val) => (
        <Text strong>{Number(val).toLocaleString("vi-VN")}</Text>
      ),
    },
    {
      title: "Doanh thu",
      dataIndex: "netRevenue",
      key: "netRevenue",
      align: "right",
      width: 120,
      render: (val) => (
        <Text style={{ color: "#16a34a", fontWeight: 500 }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
  ];

  const recentOrdersColumns = [
    {
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
      width: 70,
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      ellipsis: true,
      render: (name) => name || "Khách vãng lai",
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (date) => <Text type="secondary">{date}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => {
        const statusMap = {
          PENDING: { color: "warning", text: "Chờ xác nhận" },
          CONFIRMED: { color: "processing", text: "Đã xác nhận" },
          SHIPPING: { color: "cyan", text: "Đang giao" },
          COMPLETED: { color: "success", text: "Hoàn thành" },
          CANCELED: { color: "error", text: "Đã hủy" },
        };
        const config = statusMap[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "finalAmount",
      key: "finalAmount",
      align: "right",
      width: 110,
      render: (val) => (
        <Text strong style={{ color: "#0f172a" }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: "8px 0" }}>
        <Skeleton active paragraph={{ rows: 1 }} />
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={24} sm={12} lg={8} xl={4} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <Card>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  const chartData = (data?.revenueChart || []).map((item) => ({
    date: item.date,
    netRevenue: Number(item.netRevenue) || 0,
    orderCount: item.orderCount || 0,
  }));

  return (
    <div style={{ padding: "8px 0" }}>
      { }
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 4,
              fontWeight: 700,
              color: "#0F172A",
            }}>
            <CalendarOutlined style={{ marginRight: 12 }} />
            Bảng điều khiển
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Tổng quan nhanh về hiệu suất cửa hàng điện tử Electronics Store
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleRefresh}
          loading={refreshing}>
          Làm mới
        </Button>
      </div>

      { }
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #10b981",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.15)",
              background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
            }}>
            <Statistic
              title={
                <Space>
                  <DollarOutlined />
                  <span>Doanh thu hôm nay</span>
                  <Tooltip title="Doanh thu thuần (KHÔNG bao gồm ship)">
                    <QuestionCircleOutlined style={{ color: "#8c8c8c" }} />
                  </Tooltip>
                </Space>
              }
              value={data?.todayRevenue || 0}
              formatter={(val) => formatCurrency(val)}
              valueStyle={{ color: "#059669", fontSize: 24, fontWeight: 700 }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #2563EB",
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.12)",
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            }}>
            <Statistic
              title={
                <Space>
                  <DollarOutlined />
                  <span>Doanh thu tháng</span>
                </Space>
              }
              value={data?.monthRevenue || 0}
              formatter={(val) => formatCurrency(val)}
              valueStyle={{ color: "#2563EB", fontSize: 24, fontWeight: 700 }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            }}>
            <Statistic
              title={
                <Space>
                  <ShoppingCartOutlined />
                  <span>Đơn hàng hôm nay</span>
                </Space>
              }
              value={data?.ordersToday || 0}
              valueStyle={{ fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            }}>
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined />
                  <span>Hoàn thành hôm nay</span>
                </Space>
              }
              value={data?.completedOrdersToday || 0}
              valueStyle={{ fontSize: 24, fontWeight: 600, color: "#16a34a" }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            }}>
            <Statistic
              title={
                <Space>
                  <ShoppingCartOutlined />
                  <span>Đơn hàng tháng</span>
                </Space>
              }
              value={data?.ordersThisMonth || 0}
              valueStyle={{ fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border:
                data?.activeReturnRequests > 0
                  ? "1px solid #f59e0b"
                  : "1px solid #E2E8F0",
              boxShadow:
                data?.activeReturnRequests > 0
                  ? "0 8px 24px rgba(245, 158, 11, 0.15)"
                  : "0 8px 24px rgba(15, 23, 42, 0.06)",
              background:
                data?.activeReturnRequests > 0
                  ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                  : undefined,
            }}>
            <Statistic
              title={
                <Space>
                  <SwapOutlined />
                  <span>Yêu cầu đổi/trả</span>
                </Space>
              }
              value={data?.activeReturnRequests || 0}
              valueStyle={{
                fontSize: 24,
                fontWeight: 600,
                color: data?.activeReturnRequests > 0 ? "#d97706" : undefined,
              }}
            />
          </Card>
        </Col>
      </Row>

      { }
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        { }
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <DollarOutlined />
                <span>Doanh thu 7 ngày gần nhất</span>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            }}
            bodyStyle={{ padding: 16 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    tickLine={{ stroke: "#E2E8F0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    tickLine={{ stroke: "#E2E8F0" }}
                    tickFormatter={(v) =>
                      `${(Number(v) / 1000000).toFixed(1)}M`
                    }
                  />
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="netRevenue"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ fill: "#2563EB", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "#2563EB" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Chưa có dữ liệu doanh thu" />
            )}
          </Card>
        </Col>

        { }
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: "#f59e0b" }} />
                <span>Sản phẩm bán chạy tháng này</span>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            }}
            bodyStyle={{ padding: 0 }}>
            <Table
              columns={topProductsColumns}
              dataSource={data?.topProducts || []}
              rowKey="productId"
              pagination={false}
              size="small"
              locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
            />
          </Card>
        </Col>
      </Row>

      { }
      <Card
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>Đơn hàng gần đây</span>
          </Space>
        }
        style={{
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
        bodyStyle={{ padding: 0 }}>
        <Table
          columns={recentOrdersColumns}
          dataSource={data?.recentOrders || []}
          rowKey="orderId"
          pagination={false}
          size="middle"
          scroll={{ x: 600 }}
          locale={{ emptyText: <Empty description="Chưa có đơn hàng" /> }}
        />
      </Card>

      { }
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 Doanh thu được tính từ đơn hàng HOÀN THÀNH và{" "}
          <strong>KHÔNG bao gồm phí vận chuyển</strong>
        </Text>
      </div>
    </div>
  );
};

export default Dashboard;
