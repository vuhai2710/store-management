import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Descriptions, Tag, Button, Avatar } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeById } from '../store/slices/employeesSlice';
import dayjs from 'dayjs';

const { Title } = Typography;

const fmtDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '-');
const fmtDateTime = (v) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-');
const fmtMoney = (v) => (v != null ? Number(v).toLocaleString('vi-VN') : '-');

const EmployeeDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentEmployee, loading } = useSelector((state) => state.employees);

  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentEmployee) {
    return <div>Không tìm thấy nhân viên</div>;
  }

  const {
    employeeName,
    email,
    phoneNumber,
    address,
    hireDate,
    baseSalary,
    username,
    isActive,
    createdAt,
    updatedAt,
  } = currentEmployee;

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
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            >
              {employeeName?.charAt(0)}
            </Avatar>
          </Descriptions.Item>
          <Descriptions.Item label="Tên nhân viên">
            {employeeName}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            {username}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {email}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {phoneNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={isActive ? 'success' : 'default'}>
              {isActive ? 'Hoạt động' : 'Vô hiệu'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày vào làm">
            {fmtDate(hireDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Lương cơ bản">
            {fmtMoney(baseSalary)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {fmtDateTime(createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật">
            {fmtDateTime(updatedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {address || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default EmployeeDetail;
