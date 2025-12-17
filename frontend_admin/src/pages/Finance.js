import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Empty,
  Spin,
  message,
  DatePicker,
  Select,
  Space,
  Tooltip,
  Skeleton,
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  GiftOutlined,
  CreditCardOutlined,
  TruckOutlined,
  QuestionCircleOutlined,
  LineChartOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { reportService } from '../services/reportService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Finance = () => {

  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [groupBy, setGroupBy] = useState('DAY');

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [productData, setProductData] = useState([]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 VNĐ';
    return `${Number(value).toLocaleString('vi-VN')} VNĐ`;
  };

  const loadSummary = useCallback(async () => {
    try {
      const fromDate = dateRange[0].format('YYYY-MM-DD');
      const toDate = dateRange[1].format('YYYY-MM-DD');

      const data = await reportService.getRevenueSummary(fromDate, toDate);
      setSummary(data);
    } catch (error) {
      console.error('Error loading revenue summary:', error);
      message.error('Lỗi khi tải dữ liệu tổng quan');
    }
  }, [dateRange]);

  const loadChartData = useCallback(async () => {
    try {
      setChartLoading(true);
      const fromDate = dateRange[0].format('YYYY-MM-DD');
      const toDate = dateRange[1].format('YYYY-MM-DD');

      const data = await reportService.getRevenueByTime(fromDate, toDate, groupBy);
      setChartData(data || []);
    } catch (error) {
      console.error('Error loading chart data:', error);
      message.error('Lỗi khi tải dữ liệu biểu đồ');
    } finally {
      setChartLoading(false);
    }
  }, [dateRange, groupBy]);

  const loadProductData = useCallback(async () => {
    try {
      setTableLoading(true);
      const fromDate = dateRange[0].format('YYYY-MM-DD');
      const toDate = dateRange[1].format('YYYY-MM-DD');

      const data = await reportService.getRevenueByProduct(fromDate, toDate, 20);
      setProductData(data || []);
    } catch (error) {
      console.error('Error loading product data:', error);
      message.error('Lỗi khi tải dữ liệu sản phẩm');
    } finally {
      setTableLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadSummary(), loadChartData(), loadProductData()]);
      setLoading(false);
    };
    loadAll();
  }, [loadSummary, loadChartData, loadProductData]);

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates);
    }
  };

  const handleGroupByChange = (value) => {
    setGroupBy(value);
  };

  useEffect(() => {
    if (!loading) {
      loadChartData();
    }
  }, [groupBy]);

  const rechartsData = chartData.map((item) => ({
    time: item.time,
    netRevenue: Number(item.netRevenue) || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: '#2563EB' }}>
            Doanh thu thuần: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      width: 250,
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.productCode}
          </Text>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'quantitySold',
      key: 'quantitySold',
      width: 120,
      align: 'right',
      render: (val) => Number(val).toLocaleString('vi-VN'),
    },
    {
      title: (
        <Space>
          Doanh thu
          <Tooltip title="SUM(số lượng × giá bán)">
            <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'productRevenue',
      key: 'productRevenue',
      width: 150,
      align: 'right',
      render: formatCurrency,
    },
    {
      title: (
        <Space>
          Giảm giá
          <Tooltip title="Phân bổ theo tỷ lệ doanh thu">
            <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'discount',
      key: 'discount',
      width: 130,
      align: 'right',
      render: (val) => (
        <Text type="success">-{formatCurrency(val)}</Text>
      ),
    },
    {
      title: (
        <Space>
          Doanh thu thuần
          <Tooltip title="Doanh thu - Giảm giá">
            <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'netRevenue',
      key: 'netRevenue',
      width: 150,
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#2563EB' }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Giá TB',
      dataIndex: 'avgSellingPrice',
      key: 'avgSellingPrice',
      width: 130,
      align: 'right',
      render: formatCurrency,
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '8px 0' }}>
        <Skeleton active paragraph={{ rows: 1 }} />
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Col xs={24} sm={12} md={8} lg={4} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Card style={{ marginTop: 24 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 0' }}>
      { }
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
            <LineChartOutlined style={{ marginRight: 12 }} />
            Báo cáo Doanh thu & Tài chính
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Theo dõi doanh thu, chi phí và lợi nhuận của TechStore
          </Text>
        </div>

        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            allowClear={false}
            style={{ minWidth: 280 }}
          />
          <Select
            value={groupBy}
            onChange={handleGroupByChange}
            style={{ width: 120 }}
          >
            <Option value="DAY">Theo ngày</Option>
            <Option value="MONTH">Theo tháng</Option>
            <Option value="YEAR">Theo năm</Option>
          </Select>
        </Space>
      </div>

      { }
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              height: '100%',
            }}
          >
            <Statistic
              title={
                <Space>
                  <ShoppingOutlined />
                  <span>Doanh thu bán hàng</span>
                  <Tooltip title="SUM(số lượng × giá bán) từ đơn hoàn thành. KHÔNG bao gồm phí ship.">
                    <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              value={summary?.productRevenue || 0}
              formatter={(val) => formatCurrency(val)}
              valueStyle={{ color: '#16a34a', fontSize: 20 }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              height: '100%',
            }}
          >
            <Statistic
              title={
                <Space>
                  <GiftOutlined />
                  <span>Giảm giá</span>
                  <Tooltip title="Tổng giảm giá từ mã khuyến mãi và tự động">
                    <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              value={summary?.totalDiscount || 0}
              formatter={(val) => `-${formatCurrency(val)}`}
              valueStyle={{ color: '#f59e0b', fontSize: 20 }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              height: '100%',
            }}
          >
            <Statistic
              title={
                <Space>
                  <DollarOutlined />
                  <span>Doanh thu thuần</span>
                  <Tooltip title="Doanh thu - Giảm giá">
                    <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              value={summary?.netRevenue || 0}
              formatter={(val) => formatCurrency(val)}
              valueStyle={{ color: '#2563EB', fontSize: 20 }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              height: '100%',
            }}
          >
            <Statistic
              title={
                <Space>
                  <CreditCardOutlined />
                  <span>Giá vốn</span>
                  <Tooltip title="Chi phí nhập hàng ước tính từ đơn nhập">
                    <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              value={summary?.importCost || 0}
              formatter={(val) => formatCurrency(val)}
              valueStyle={{ color: '#dc2626', fontSize: 20 }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #10b981',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
              height: '100%',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            }}
          >
            <Statistic
              title={
                <Space>
                  <BarChartOutlined />
                  <span>Lợi nhuận gộp</span>
                  <Tooltip title="Doanh thu thuần - Giá vốn">
                    <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              value={summary?.grossProfit || 0}
              formatter={(val) => formatCurrency(val)}
              valueStyle={{ color: '#059669', fontSize: 20, fontWeight: 700 }}
            />
          </Card>
        </Col>

        { }
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px dashed #d9d9d9',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.03)',
              height: '100%',
              background: '#fafafa',
            }}
          >
            <Statistic
              title={
                <Space>
                  <TruckOutlined />
                  <span>Phí vận chuyển</span>
                  <Tooltip title="Chỉ tham khảo - KHÔNG tính vào doanh thu">
                    <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              value={summary?.shippingFeeTotal || 0}
              formatter={(val) => formatCurrency(val)}
              valueStyle={{ color: '#8c8c8c', fontSize: 20 }}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              * Không tính vào doanh thu
            </Text>
          </Card>
        </Col>
      </Row>

      { }
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
            <Statistic
              title="Tổng đơn hàng"
              value={summary?.totalOrders || 0}
              valueStyle={{ fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
            <Statistic
              title="Hoàn thành"
              value={summary?.completedOrders || 0}
              valueStyle={{ fontSize: 18, color: '#16a34a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
            <Statistic
              title="Đã hủy"
              value={summary?.canceledOrders || 0}
              valueStyle={{ fontSize: 18, color: '#dc2626' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
            <Statistic
              title="Đổi/Trả"
              value={summary?.returnedOrders || 0}
              valueStyle={{ fontSize: 18, color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      { }
      <Card
        title={
          <Space>
            <LineChartOutlined />
            <span>Biểu đồ doanh thu thuần theo thời gian</span>
          </Space>
        }
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        }}
        bodyStyle={{ padding: 16 }}
      >
        {chartLoading ? (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        ) : rechartsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={{ stroke: '#E2E8F0' }}
                tickFormatter={(v) => `${(Number(v) / 1000000).toFixed(1)}M`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="netRevenue"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#2563EB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="Không có dữ liệu trong khoảng thời gian này" />
        )}
      </Card>

      { }
      <Card
        title={
          <Space>
            <ShoppingOutlined />
            <span>Doanh thu theo sản phẩm (Top 20)</span>
          </Space>
        }
        style={{
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Table
          columns={productColumns}
          dataSource={productData}
          rowKey="productId"
          loading={tableLoading}
          pagination={false}
          size="middle"
          scroll={{ x: 1000 }}
          locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
        />
      </Card>

      { }
      <Card
        title="Công thức tính toán"
        size="small"
        style={{
          marginTop: 16,
          borderRadius: 12,
          border: '1px solid #E2E8F0',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row gutter={[16, 8]}>
          <Col xs={24} md={12}>
            <Text code>Doanh thu bán hàng</Text> = SUM(số lượng × giá bán) từ đơn hoàn thành
          </Col>
          <Col xs={24} md={12}>
            <Text code>Doanh thu thuần</Text> = Doanh thu bán hàng - Giảm giá
          </Col>
          <Col xs={24} md={12}>
            <Text code>Giá vốn</Text> = SUM(số lượng × giá nhập) ước tính từ đơn nhập
          </Col>
          <Col xs={24} md={12}>
            <Text code>Lợi nhuận gộp</Text> = Doanh thu thuần - Giá vốn
          </Col>
        </Row>
        <div style={{ marginTop: 12 }}>
          <Text type="warning">
            ⚠️ Phí vận chuyển KHÔNG được tính vào doanh thu hoặc lợi nhuận.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Finance;
