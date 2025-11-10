import React, { useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Button } from 'antd';
import { DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, WalletOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFinancialData, fetchPayroll } from '../store/slices/financeSlice';

const { Title } = Typography;

const Finance = () => {
  const dispatch = useDispatch();
  const { financialData, payroll, loading } = useSelector((state) => state.finance);

  useEffect(() => {
    dispatch(fetchFinancialData());
    dispatch(fetchPayroll());
  }, [dispatch]);

  const payrollColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      render: (salary) => `${salary?.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (bonus) => `${bonus?.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Tổng lương',
      dataIndex: 'totalSalary',
      key: 'totalSalary',
      render: (total) => `${total?.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Quản lý Tài chính</Title>
        <p>Theo dõi doanh thu, chi phí và quản lý lương nhân viên</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={financialData.revenue || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="VNĐ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng chi phí"
              value={financialData.expenses || 0}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="VNĐ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Lợi nhuận"
              value={financialData.profit || 0}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="VNĐ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng lương tháng"
              value={payroll.reduce((sum, item) => sum + (item.totalSalary || 0), 0)}
              prefix={<WalletOutlined />}
              suffix="VNĐ"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Bảng lương nhân viên" className="table-container">
            <div style={{ marginBottom: '16px' }}>
              <Button type="primary">
                Xuất báo cáo
              </Button>
            </div>
            <Table
              columns={payrollColumns}
              dataSource={payroll}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Finance;
