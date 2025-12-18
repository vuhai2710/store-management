import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchEmployees,
  deleteEmployee,
  createEmployee,
  updateEmployee,
  setPagination,
  setSort,
} from "../store/slices/employeesSlice";
import { useDebounce } from "../hooks";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { formatDate } from "../utils/formatUtils";
dayjs.extend(customParseFormat);

const { Title } = Typography;

const Employees = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, loading, pagination, sort } = useSelector(
    (state) => state.employees
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState("");

  const debouncedKeyword = useDebounce(searchKeyword, 300);

  useEffect(() => {
    dispatch(
      fetchEmployees({
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortBy: sort.sortBy,
        sortDirection: sort.sortDirection,
        keyword: debouncedKeyword || undefined,
      })
    );
  }, [
    dispatch,
    pagination.current,
    pagination.pageSize,
    sort.sortBy,
    sort.sortDirection,
    debouncedKeyword,
  ]);

  useEffect(() => {
    dispatch(setPagination({ current: 1, pageSize: pagination.pageSize }));
  }, [debouncedKeyword, dispatch, pagination.pageSize]);

  const handleResetFilters = () => {
    setSearchKeyword("");
    dispatch(setPagination({ current: 1, pageSize: pagination.pageSize }));
  };

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

      hireDate: record.hireDate
        ? dayjs(record.hireDate, ["DD/MM/YYYY", "DD/MM/YYYY HH:mm:ss"], true)
        : null,
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
      message.success("Xóa nhân viên thành công");
      dispatch(
        fetchEmployees({
          page: pagination.current,
          pageSize: pagination.pageSize,
          sortBy: sort.sortBy,
          sortDirection: sort.sortDirection,
        })
      );
    } catch (e) {
      message.error(e || "Xóa nhân viên thất bại");
    }
  };

  const handleSubmit = async (values) => {

    const payload = {
      employeeName: values.employeeName,
      phoneNumber: values.phoneNumber,
      username: values.username,
      password: values.password || undefined,

      hireDate: values.hireDate ? values.hireDate.format("DD/MM/YYYY") : null,
      address: values.address,
      baseSalary: values.baseSalary ?? null,
    };

    if (!editingEmployee) {
      payload.email = values.email;
    }

    try {
      if (editingEmployee) {
        await dispatch(
          updateEmployee({
            id: editingEmployee.idEmployee,
            employeeData: payload,
          })
        ).unwrap();
        message.success("Cập nhật nhân viên thành công");
      } else {
        await dispatch(createEmployee(payload)).unwrap();
        message.success("Tạo nhân viên thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      dispatch(
        fetchEmployees({
          page: pagination.current,
          pageSize: pagination.pageSize,
          sortBy: sort.sortBy,
          sortDirection: sort.sortDirection,
        })
      );
    } catch (e) {
      message.error(e || "Có lỗi xảy ra khi lưu nhân viên");
    }
  };

  const handleTableChange = (pager, _filters, sorter) => {
    const nextPage = pager.current || 1;
    const nextSize = pager.pageSize || pagination.pageSize;
    const nextSortBy = sorter?.field || sort.sortBy;
    const nextSortDir =
      sorter?.order === "ascend"
        ? "ASC"
        : sorter?.order === "descend"
        ? "DESC"
        : sort.sortDirection;

    dispatch(setPagination({ current: nextPage, pageSize: nextSize }));
    dispatch(setSort({ sortBy: nextSortBy, sortDirection: nextSortDir }));
  };

  const fmtDate = (v) => formatDate(v, "DD/MM/YYYY");
  const fmtDateTime = (v) => formatDate(v, "DD/MM/YYYY HH:mm");
  const fmtMoney = (v) => (v != null ? Number(v).toLocaleString("vi-VN") : "-");

  const columns = [
    {
      title: "ID",
      dataIndex: "idEmployee",
      key: "idEmployee",
      width: 80,
      sorter: true,
    },
    {
      title: "Tên nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      sorter: true,
    },
    { title: "Username", dataIndex: "username", key: "username", sorter: true },
    { title: "Email", dataIndex: "email", key: "email", sorter: true },
    { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      sorter: true,
      render: (v) => (
        <Tag color={v ? "green" : "default"}>{v ? "Hoạt động" : "Vô hiệu"}</Tag>
      ),
    },
    {
      title: "Ngày vào làm",
      dataIndex: "hireDate",
      key: "hireDate",
      sorter: true,
      render: fmtDate,
    },
    {
      title: "Lương cơ bản",
      dataIndex: "baseSalary",
      key: "baseSalary",
      render: fmtMoney,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: fmtDateTime,
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: true,
      render: fmtDateTime,
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.idEmployee)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xóa nhân viên này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.idEmployee)}>
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      <div
        className="page-header"
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 4,
              fontWeight: 700,
              color: "#0F172A",
            }}>
            Quản lý nhân viên
          </Title>
          <p
            style={{
              margin: 0,
              color: "#64748B",
              fontSize: 14,
            }}>
            Quản lý hồ sơ và trạng thái nhân viên TechStore
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
          }}>
          Thêm nhân viên
        </Button>
      </div>

      <Card
        className="table-container"
        style={{
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          background: "#FFFFFF",
        }}
        bodyStyle={{ padding: 16 }}>
        <div
          className="table-toolbar"
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}>
          <Input
            placeholder="Tìm tên, SĐT, email..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            style={{ width: 280, maxWidth: "100%" }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
          />
          <Button onClick={handleResetFilters} icon={<ReloadOutlined />}>
            Đặt lại
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
          scroll={{ x: "max-content" }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="employeeName"
            label="Tên nhân viên"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhân viên" },
            ]}>
            <Input placeholder="Nhập tên nhân viên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: !editingEmployee, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
            extra={
              editingEmployee ? "Email không thể thay đổi sau khi tạo" : null
            }>
            <Input placeholder="Nhập email" disabled={!!editingEmployee} />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
            ]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập" },
            ]}>
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              editingEmployee
                ? "Mật khẩu mới (để trống nếu không đổi)"
                : "Mật khẩu"
            }
            rules={[
              { required: !editingEmployee, message: "Vui lòng nhập mật khẩu" },
            ]}>
            <Input.Password
              placeholder={
                editingEmployee ? "Nhập mật khẩu mới" : "Nhập mật khẩu"
              }
            />
          </Form.Item>

          <Form.Item name="hireDate" label="Ngày vào làm">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item name="baseSalary" label="Lương cơ bản">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="Nhập lương cơ bản"
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingEmployee ? "Cập nhật" : "Tạo"} nhân viên
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;
