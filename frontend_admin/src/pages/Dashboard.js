import React, { useEffect } from "react";
import { Row, Col, Card, Statistic, Typography, Spin } from "antd";
import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  UserOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../store/slices/ordersSlice";
import { fetchProducts } from "../store/slices/productsSlice";
import { fetchCustomers } from "../store/slices/customersSlice";
import { fetchFinancialData } from "../store/slices/financeSlice";
import RevenueChart from "../components/dashboard/RevenueChart";
import OrderStatusChart from "../components/dashboard/OrderStatusChart";
import TopProductsChart from "../components/dashboard/TopProductsChart";
import RecentOrders from "../components/dashboard/RecentOrders";

const { Title } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { orders, loading: ordersLoading } = useSelector((state) => state.orders);
  // Lấy đúng pagination từ slice products
  const { pagination, loading: productsLoading } = useSelector(
    (state) => state.products || {}
  );
  const { customers, loading: customersLoading } = useSelector(
    (state) => state.customers
  );
  const { financialData, loading: financeLoading } = useSelector(
    (state) => state.finance
  );

  useEffect(() => {
    // Fetch dashboard data
    dispatch(fetchOrders({ limit: 5 }));
    // Gọi products với pageSize nhỏ để lấy tổng số sản phẩm từ totalElements
    dispatch(fetchProducts({ pageNo: 1, pageSize: 1, sortBy: "idProduct", sortDirection: "ASC" }));
    dispatch(fetchCustomers({ limit: 10 }));
    dispatch(fetchFinancialData());
  }, [dispatch]);

  const isLoading =
    ordersLoading || productsLoading || customersLoading || financeLoading;

  // Thống kê
  const totalOrders = orders?.length || 0;
  const totalProducts = pagination?.totalElements || 0; // lấy từ totalElements
  const totalCustomers = customers?.length || 0;
  const totalRevenue = (financialData?.revenue || 0);

  const statsCards = [
    {
      title: "Tổng đơn hàng",
      value: totalOrders,
      icon: <ShoppingCartOutlined />,
      color: "#1890ff",
      trendUp: true,
    },
    {
      title: "Sản phẩm",
      value: totalProducts,
      icon: <AppstoreOutlined />,
      color: "#52c41a",
      trendUp: true,
    },
    {
      title: "Khách hàng",
      value: totalCustomers,
      icon: <UserOutlined />,
      color: "#fa8c16",
      trendUp: true,
    },
    {
      title: "Doanh thu (VNĐ)",
      value: totalRevenue.toLocaleString("vi-VN"),
      icon: <DollarOutlined />,
      color: "#eb2f96",
      trendUp: true,
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Dashboard</Title>
        <p>Tổng quan hệ thống quản lý cửa hàng điện tử</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stats-card" style={{ background: stat.color }}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: "white" }}
                suffix={
                  <span style={{ fontSize: "14px", opacity: 0.9 }}>
                    {stat.trendUp ? (
                      <ArrowUpOutlined style={{ color: "#52c41a" }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: "#ff4d4f" }} />
                    )}
                    {stat.trend}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ doanh thu" className="chart-container">
            <RevenueChart />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái đơn hàng" className="chart-container">
            <OrderStatusChart />
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Sản phẩm bán chạy" className="chart-container">
            <TopProductsChart />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây" className="chart-container">
            <RecentOrders />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
