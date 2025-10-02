import React from 'react';
import { Card, Typography, Row, Col, Button, Space, DatePicker, Select } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import RevenueChart from '../components/dashboard/RevenueChart';
import OrderStatusChart from '../components/dashboard/OrderStatusChart';
import TopProductsChart from '../components/dashboard/TopProductsChart';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  return (
    <div>
      <div className="page-header">
        <Title level={1}>Báo cáo & Thống kê</Title>
        <p>Xuất báo cáo và phân tích dữ liệu kinh doanh</p>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Space wrap>
          <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
          <Select placeholder="Loại báo cáo" style={{ width: 200 }}>
            <Option value="revenue">Báo cáo doanh thu</Option>
            <Option value="orders">Báo cáo đơn hàng</Option>
            <Option value="products">Báo cáo sản phẩm</Option>
            <Option value="customers">Báo cáo khách hàng</Option>
          </Select>
          <Button type="primary" icon={<DownloadOutlined />}>
            Xuất Excel
          </Button>
          <Button icon={<PrinterOutlined />}>
            In báo cáo
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ doanh thu theo thời gian">
            <RevenueChart />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố trạng thái đơn hàng">
            <OrderStatusChart />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Top sản phẩm bán chạy">
            <TopProductsChart />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;


