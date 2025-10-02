import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Descriptions, Table, Tag, Button, Avatar } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeById } from '../store/slices/employeesSlice';

const { Title } = Typography;

const EmployeeDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentEmployee, loading } = useSelector((state) => state.employees);

  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById(id));
    }
  }, [dispatch, id]);

  const activityColumns = [
    {
      title: 'Hoạt động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentEmployee) {
    return <div>Không tìm thấy nhân viên</div>;
  }

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Thông tin nhân viên</Title>
        <Button icon={<EditOutlined />}>Chỉnh sửa</Button>
      </div>

      <Card title="Thông tin cá nhân" style={{ marginBottom: '16px' }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Avatar">
            <Avatar 
              size={64}
              src={currentEmployee.avatar} 
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            >
              {currentEmployee.name?.charAt(0)}
            </Avatar>
          </Descriptions.Item>
          <Descriptions.Item label="Tên nhân viên">
            {currentEmployee.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {currentEmployee.email}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {currentEmployee.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Phòng ban">
            <Tag color="blue">{currentEmployee.department}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Chức vụ">
            {currentEmployee.position}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={currentEmployee.status === 'active' ? 'success' : 'default'}>
              {currentEmployee.status === 'active' ? 'Hoạt động' : 'Nghỉ việc'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày vào làm">
            {new Date(currentEmployee.hireDate).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Hoạt động gần đây">
        <Table
          columns={activityColumns}
          dataSource={currentEmployee.activities || []}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default EmployeeDetail;
