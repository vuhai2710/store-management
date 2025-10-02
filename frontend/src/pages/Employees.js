import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Card, Typography, message, Popconfirm, Tooltip, Tag, Avatar, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees, deleteEmployee, createEmployee, updateEmployee } from '../store/slices/employeesSlice';

const { Title } = Typography;
const { Option } = Select;

const Employees = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, loading } = useSelector((state) => state.employees);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setIsModalVisible(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsModalVisible(true);
  };

  const handleViewEmployee = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await dispatch(deleteEmployee(employeeId)).unwrap();
      message.success('Xóa nhân viên thành công!');
    } catch (error) {
      message.error('Xóa nhân viên thất bại!');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingEmployee) {
        await dispatch(updateEmployee({ id: editingEmployee.id, employeeData: values })).unwrap();
        message.success('Cập nhật nhân viên thành công!');
      } else {
        await dispatch(createEmployee(values)).unwrap();
        message.success('Tạo nhân viên thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
      dispatch(fetchEmployees());
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu nhân viên');
    }
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 60,
      render: (avatar, record) => (
        <Avatar 
          src={avatar} 
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        >
          {record.name?.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (department) => <Tag color="blue">{department}</Tag>,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Phân quyền',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Admin' : 'Nhân viên bán hàng'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Hoạt động' : 'Nghỉ việc'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewEmployee(record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditEmployee(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDeleteEmployee(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Quản lý Nhân viên</Title>
        <p>Quản lý thông tin nhân viên và phân quyền</p>
      </div>

      <Card className="table-container">
        <div style={{ marginBottom: '16px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateEmployee}>
            Thêm nhân viên
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={employees}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Employee Form Modal */}
      <Modal
        title={editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={editingEmployee ? {
            name: editingEmployee.name,
            email: editingEmployee.email,
            phone: editingEmployee.phone,
            department: editingEmployee.department,
            position: editingEmployee.position,
            role: editingEmployee.role || 'sales',
            status: editingEmployee.status,
            username: editingEmployee.username,
          } : {
            role: 'sales',
            status: 'active'
          }}
        >
          <Form.Item
            name="name"
            label="Tên nhân viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}
          >
            <Input placeholder="Nhập tên nhân viên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: !editingEmployee, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Phòng ban"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
          >
            <Select placeholder="Chọn phòng ban">
              <Option value="Sales">Sales</Option>
              <Option value="IT">IT</Option>
              <Option value="Finance">Finance</Option>
              <Option value="HR">HR</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="Chức vụ"
            rules={[{ required: true, message: 'Vui lòng nhập chức vụ' }]}
          >
            <Input placeholder="Nhập chức vụ" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Phân quyền"
            rules={[{ required: true, message: 'Vui lòng chọn phân quyền' }]}
          >
            <Select placeholder="Chọn phân quyền">
              <Option value="admin">Admin</Option>
              <Option value="sales">Nhân viên bán hàng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Nghỉ việc</Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: '16px' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingEmployee ? 'Cập nhật' : 'Tạo'} nhân viên
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;


