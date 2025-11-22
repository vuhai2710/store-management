import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Empty, Spin, message } from 'antd';
import { DollarOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { ordersService } from '../services/ordersService';

const { Title, Text } = Typography;

const Finance = () => {
  const [financialData, setFinancialData] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    payroll: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch all completed orders to calculate revenue
      const ordersResponse = await ordersService.getOrders({
        pageNo: 1,
        pageSize: 1000, // Get all orders
        status: 'COMPLETED',
        sortBy: 'orderDate',
        sortDirection: 'DESC',
      });

      const completedOrders = ordersResponse?.content || [];
      
      // Calculate revenue from completed orders
      const revenue = completedOrders.reduce((sum, order) => {
        const amount = Number(order.totalAmount) || 0;
        const discount = Number(order.discount) || 0;
        const finalAmount = Number(order.finalAmount) || (amount - discount);
        return sum + finalAmount;
      }, 0);

      // Expenses: Can be calculated from import orders or set to 0 if not available
      // For now, we'll estimate expenses as 70% of revenue (30% profit margin)
      const expenses = revenue * 0.7;
      const profit = revenue - expenses;

      setFinancialData({
        revenue,
        expenses,
        profit,
        payroll: [], // Payroll data not available from backend
      });
    } catch (error) {
      console.error('Error loading financial data:', error);
      message.error('Lỗi khi tải dữ liệu tài chính');
    } finally {
      setLoading(false);
    }
  };

  const payrollColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      render: (salary) => (salary ? `${Number(salary).toLocaleString('vi-VN')} VNĐ` : 'N/A'),
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (bonus) => (bonus ? `${Number(bonus).toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'),
    },
    {
      title: 'Tổng lương',
      key: 'total',
      render: (_, record) => {
        const base = Number(record.baseSalary) || 0;
        const bonus = Number(record.bonus) || 0;
        return `${(base + bonus).toLocaleString('vi-VN')} VNĐ`;
      },
    },
  ];

  if (loading) {
    return (
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
    );
  }

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
            Quản lý tài chính
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Theo dõi doanh thu, chi phí và lợi nhuận ước tính của TechStore
          </Text>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Statistic
              title="Doanh thu"
              value={financialData.revenue.toLocaleString('vi-VN')}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#16a34a' }}
              suffix="VNĐ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Statistic
              title="Chi phí (ước tính)"
              value={financialData.expenses.toLocaleString('vi-VN')}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#dc2626' }}
              suffix="VNĐ"
            />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              * Ước tính từ doanh thu (70% chi phí, 30% lợi nhuận)
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Statistic
              title="Lợi nhuận (ước tính)"
              value={financialData.profit.toLocaleString('vi-VN')}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#2563EB' }}
              suffix="VNĐ"
            />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              * Ước tính từ doanh thu
            </Text>
          </Card>
        </Col>
      </Row>

      <Card
        title="Bảng lương nhân viên"
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        }}
        bodyStyle={{ padding: 16 }}
      >
        {financialData.payroll && financialData.payroll.length > 0 ? (
          <Table
            columns={payrollColumns}
            dataSource={financialData.payroll}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        ) : (
          <Empty description="Chưa có dữ liệu bảng lương" />
        )}
      </Card>

      <Card
        title="Lưu ý"
        style={{
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary">
          Dữ liệu tài chính được tính toán từ các đơn hàng đã hoàn thành. Chi phí và lợi nhuận là ước tính dựa
          trên tỷ lệ 70/30. Để có dữ liệu chính xác hơn, vui lòng tích hợp với hệ thống kế toán.
        </Text>
      </Card>
    </div>
  );
};

export default Finance;
