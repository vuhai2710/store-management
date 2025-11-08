import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Card, Typography, message, Popconfirm, Tooltip, Tag,
  Modal, Form, Input, DatePicker, InputNumber
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees, deleteEmployee, createEmployee, updateEmployee, setPagination, setSort } from '../store/slices/employeesSlice';
import dayjs from 'dayjs';

const { Title } = Typography;

const Employees = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, loading, pagination, sort } = useSelector((state) => state.employees);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchEmployees({
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: sort.sortBy,
      sortDirection: sort.sortDirection,
    }));
  }, [dispatch, pagination.current, pagination.pageSize, sort.sortBy, sort.sortDirection]);

  const openCreate = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEdit = (record) => {
    setEditingEmployee(record);
    form.setFieldsValue({
      employeeName: record.employeeName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      username: record.username,
      hireDate: record.hireDate ? dayjs(record.hireDate) : null,
      address: record.address,
      baseSalary: record.baseSalary,
      password: undefined,
    });
    setIsModalVisible(true);
  };

  const handleView = (idEmployee) => navigate(`/employees/${idEmployee}`);

  const handleDelete = async (idEmployee) => {
    try {
      await dispatch(deleteEmployee(idEmployee)).unwrap();
      message.success('Xóa nhân viên thành công');
      dispatch(fetchEmployees({
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortBy: sort.sortBy,
        sortDirection: sort.sortDirection,
      }));
    } catch (e) {
      message.error(e || 'Xóa nhân viên thất bại');
    }
  };

  const handleSubmit = async (values) => {
    const payload = {
      employeeName: values.employeeName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      username: values.username,
      password: values.password, // optional khi edit
      // BE yêu cầu dd/MM/yyyy
      hireDate: values.hireDate ? values.hireDate.format('DD/MM/YYYY') : null,
      address: values.address,
      baseSalary: values.baseSalary ?? null,
    };

    try {
      if (editingEmployee) {
        await dispatch(updateEmployee({ id: editingEmployee.idEmployee, employeeData: payload })).unwrap();
        message.success('Cập nhật nhân viên thành công');
      } else {
        await dispatch(createEmployee(payload)).unwrap();
        message.success('Tạo nhân viên thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      dispatch(fetchEmployees({
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortBy: sort.sortBy,
        sortDirection: sort.sortDirection,
      }));
    } catch (e) {
      message.error(e || 'Có lỗi xảy ra khi lưu nhân viên');
    }
  };

  const handleTableChange = (pager, _filters, sorter) => {
    const nextPage = pager.current || 1;
    const nextSize = pager.pageSize || pagination.pageSize;
    const nextSortBy = sorter?.field || sort.sortBy;
    const nextSortDir = sorter?.order === 'ascend' ? 'ASC'
      : sorter?.order === 'descend' ? 'DESC'
      : sort.sortDirection;

    dispatch(setPagination({ current: nextPage, pageSize: nextSize }));
    dispatch(setSort({ sortBy: nextSortBy, sortDirection: nextSortDir }));
  };

  const fmtDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '-');
  const fmtDateTime = (v) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-');
  const fmtMoney = (v) => (v != null ? Number(v).toLocaleString('vi-VN') : '-');

  const columns = [
    { title: 'ID', dataIndex: 'idEmployee', key: 'idEmployee', width: 80, sorter: true },
    { title: 'Tên nhân viên', dataIndex: 'employeeName', key: 'employeeName', sorter: true },
    { title: 'Username', dataIndex: 'username', key: 'username', sorter: true },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: true },
    { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: true,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Hoạt động' : 'Vô hiệu'}</Tag>,
    },
    { title: 'Ngày vào làm', dataIndex: 'hireDate', key: 'hireDate', sorter: true, render: fmtDate },
    { title: 'Lương cơ bản', dataIndex: 'baseSalary', key: 'baseSalary', render: fmtMoney },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', sorter: true, render: fmtDateTime },
    { title: 'Cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', sorter: true, render: fmtDateTime },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record.idEmployee)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xóa nhân viên này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.idEmployee)}
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
        <p>Quản lý thông tin nhân viên</p>
      </div>

      <Card className="table-container">
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm nhân viên
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={employees}
          loading={loading}
          rowKey="idEmployee"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="employeeName"
            label="Tên nhân viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}
          >
            <Input placeholder="Nhập tên nhân viên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
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

          <Form.Item name="hireDate" label="Ngày vào làm">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item name="baseSalary" label="Lương cơ bản">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập lương cơ bản" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
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