import React, { useEffect, useState } from "react";
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
import { ordersService } from "../services/ordersService";
import { productsService } from "../services/productsService";
import { customersService } from "../services/customersService";
import RevenueChart from "../components/dashboard/RevenueChart";
import OrderStatusChart from "../components/dashboard/OrderStatusChart";
import TopProductsChart from "../components/dashboard/TopProductsChart";
import RecentOrders from "../components/dashboard/RecentOrders";

const { Title } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { orders, pagination: ordersPagination, loading: ordersLoading } = useSelector(
    (state) => state.orders || {}
  );
  const { list: products, pagination: productsPagination, loading: productsLoading } = useSelector(
    (state) => state.products || {}
  );
  const { list: customers, pagination: customersPagination, loading: customersLoading } = useSelector(
    (state) => state.customers || {}
  );
  
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: [],
    allOrdersForRevenue: [],
    ordersByStatus: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch orders - get total count and recent orders for dashboard
        const ordersResponse = await ordersService.getOrders({
          pageNo: 1,
          pageSize: 100, // Get more orders for revenue calculation
          sortBy: "orderDate",
          sortDirection: "DESC",
        });
        const ordersData = ordersResponse?.content || [];
        const totalOrdersCount = ordersResponse?.totalElements || 0;

        // Calculate revenue from all completed orders (for dashboard stats)
        // Note: This is just from the first 100 orders. For accurate revenue, 
        // we'd need to fetch all completed orders or use a backend aggregation endpoint
        const completedOrders = ordersData.filter(
          (order) => order.status === "COMPLETED"
        );
        const revenue = completedOrders.reduce(
          (sum, order) => {
            const amount = Number(order.totalAmount) || 0;
            const discount = Number(order.discount) || 0;
            const finalAmount = Number(order.finalAmount) || (amount - discount);
            return sum + finalAmount;
          },
          0
        );

        // Count orders by status (from fetched orders)
        const ordersByStatus = ordersData.reduce((acc, order) => {
          const status = order.status || "UNKNOWN";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        // Fetch products - get total count
        const productsResponse = await productsService.getProductsPaginated({
          pageNo: 1,
          pageSize: 1,
          sortBy: "idProduct",
          sortDirection: "ASC",
        });
        const totalProductsCount = productsResponse?.totalElements || 0;

        // Fetch customers - get total count (use getAllCustomers -> has 'total')
        const customersResponse = await customersService.getAllCustomers({
          pageNo: 1,
          pageSize: 1,
          sortBy: "idCustomer",
          sortDirection: "ASC",
        });

        const totalCustomersCount =
          customersResponse?.total ??
          customersResponse?.totalElements ??
          customersResponse?.page?.totalElements ??
          (Array.isArray(customersResponse?.data)
            ? customersResponse.data.length
            : 0);

        setDashboardStats({
          totalOrders: totalOrdersCount,
          totalProducts: totalProductsCount,
          totalCustomers: totalCustomersCount,
          totalRevenue: revenue,
          recentOrders: ordersData.slice(0, 5),
          allOrdersForRevenue: completedOrders,
          ordersByStatus,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const isLoading = loading || ordersLoading || productsLoading || customersLoading;

  // Statistics
  const { totalOrders, totalProducts, totalCustomers, totalRevenue, recentOrders, allOrdersForRevenue, ordersByStatus } = dashboardStats;

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
            <RevenueChart orders={allOrdersForRevenue || []} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái đơn hàng" className="chart-container">
            <OrderStatusChart ordersByStatus={ordersByStatus} />
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
            <RecentOrders orders={recentOrders} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
