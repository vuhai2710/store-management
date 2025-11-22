import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Button, Space, DatePicker, Select, message, Spin } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { ordersService } from '../services/ordersService';
import RevenueChart from '../components/dashboard/RevenueChart';
import OrderStatusChart from '../components/dashboard/OrderStatusChart';
import TopProductsChart from '../components/dashboard/TopProductsChart';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [dateRange, setDateRange] = useState(null);
  const [reportType, setReportType] = useState('revenue');
  const [orders, setOrders] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [dateRange, reportType]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with date range if specified
      const params = {
        pageNo: 1,
        pageSize: 1000, // Get all orders for report
        sortBy: 'orderDate',
        sortDirection: 'DESC',
      };

      // Note: Backend doesn't support date range filter directly in orders endpoint
      // We'll filter on frontend if date range is selected
      const ordersResponse = await ordersService.getOrders(params);
      let ordersData = ordersResponse?.content || [];

      // Filter by date range if specified
      if (dateRange && dateRange.length === 2) {
        const startDate = dateRange[0];
        const endDate = dateRange[1];
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          ordersData = ordersData.filter((order) => {
            if (!order.orderDate) return false;
            const orderDate = new Date(order.orderDate);
            return orderDate >= start && orderDate <= end;
          });
        }
      }

      setOrders(ordersData);

      // Count orders by status
      const statusCount = ordersData.reduce((acc, order) => {
        const status = order.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      setOrdersByStatus(statusCount);
    } catch (error) {
      console.error('Error loading report data:', error);
      message.error('Lỗi khi tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    message.info('Chức năng xuất Excel đang được phát triển');
    // TODO: Implement Excel export using a library like xlsx
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <div
        className="page-header"
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 4,
              fontWeight: 700,
              color: '#0F172A',
            }}
          >
            Báo cáo & thống kê
          </Title>
          <p
            style={{
              margin: 0,
              color: '#64748B',
              fontSize: 14,
            }}
          >
            Theo dõi hiệu suất kinh doanh và xuất báo cáo cho TechStore
          </p>
        </div>
      </div>

      <Card
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
          background: '#FFFFFF',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Space
          wrap
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Space wrap style={{ display: 'flex', gap: 8 }}>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={setDateRange}
            />
            <Select
              placeholder="Loại báo cáo"
              style={{ width: 220 }}
              value={reportType}
              onChange={setReportType}
            >
              <Option value="revenue">Báo cáo doanh thu</Option>
              <Option value="orders">Báo cáo đơn hàng</Option>
              <Option value="products">Báo cáo sản phẩm</Option>
              <Option value="customers">Báo cáo khách hàng</Option>
            </Select>
          </Space>
          <Space wrap style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrintReport}>
              In báo cáo
            </Button>
          </Space>
        </Space>
      </Card>

      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 260,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card
                title="Biểu đồ doanh thu theo thời gian"
                style={{
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                }}
                bodyStyle={{ padding: 16 }}
              >
                <RevenueChart orders={orders} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                title="Phân bố trạng thái đơn hàng"
                style={{
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                }}
                bodyStyle={{ padding: 16 }}
              >
                <OrderStatusChart ordersByStatus={ordersByStatus} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card
                title="Top sản phẩm bán chạy"
                style={{
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                }}
                bodyStyle={{ padding: 16 }}
              >
                <TopProductsChart />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Reports;


