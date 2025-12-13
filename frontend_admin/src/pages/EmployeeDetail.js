import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Button,
  Avatar,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Space,
  message,
  Spin,
} from "antd";
import {
  EditOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  SwapOutlined,
  RollbackOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployeeDetailById,
  updateEmployee,
  clearEmployeeDetail,
} from "../store/slices/employeesSlice";
import { formatDate } from "../utils/formatUtils";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { Title } = Typography;

const fmtDate = (v) => formatDate(v, "DD/MM/YYYY");
const fmtDateTime = (v) => formatDate(v, "DD/MM/YYYY HH:mm");
const fmtMoney = (v) => (v != null ? Number(v).toLocaleString("vi-VN") : "-");

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { employeeDetail, loading } = useSelector((state) => state.employees);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeDetailById(id));
    }
    return () => {
      dispatch(clearEmployeeDetail());
    };
  }, [dispatch, id]);

  const openEditModal = () => {
    if (employeeDetail) {
      form.setFieldsValue({
        employeeName: employeeDetail.employeeName,
        phoneNumber: employeeDetail.phoneNumber,
        username: employeeDetail.username,
        hireDate: employeeDetail.hireDate
          ? dayjs(
              employeeDetail.hireDate,
              ["DD/MM/YYYY", "DD/MM/YYYY HH:mm:ss"],
              true
            )
          : null,
        address: employeeDetail.address,
        baseSalary: employeeDetail.baseSalary,
        password: undefined,
      });
      setIsModalVisible(true);
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

    try {
      await dispatch(
        updateEmployee({ id: employeeDetail.idEmployee, employeeData: payload })
      ).unwrap();
      message.success("Cập nhật nhân viên thành công");
      setIsModalVisible(false);
      form.resetFields();
      dispatch(fetchEmployeeDetailById(id));
    } catch (e) {
      message.error(e || "Có lỗi xảy ra khi cập nhật nhân viên");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!employeeDetail) {
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
    avatarUrl,
    totalOrdersHandled = 0,
    totalOrderAmount = 0,
    totalReturnOrders = 0,
    totalExchangeOrders = 0,
    pendingOrders = 0,
    completedOrders = 0,
    cancelledOrders = 0,
  } = employeeDetail;

  return (
    <div style={{ padding: "8px 0" }}>
      <div
        className="page-header"
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/employees")}>
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Thông tin nhân viên
          </Title>
        </div>
        <Button type="primary" icon={<EditOutlined />} onClick={openEditModal}>
          Chỉnh sửa
        </Button>
      </div>

      {/* Order Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng đã xử lý"
              value={totalOrdersHandled}
              prefix={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giá trị đơn hàng"
              value={totalOrderAmount}
              precision={0}
              formatter={(value) => `${fmtMoney(value)} ₫`}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Yêu cầu đổi hàng"
              value={totalExchangeOrders}
              prefix={<SwapOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Yêu cầu trả hàng"
              value={totalReturnOrders}
              prefix={<RollbackOutlined style={{ color: "#ff4d4f" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Status Breakdown */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đơn hàng chờ xử lý"
              value={pendingOrders}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đơn hàng hoàn thành"
              value={completedOrders}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đơn hàng đã hủy"
              value={cancelledOrders}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Personal Information */}
      <Card title="Thông tin cá nhân" style={{ marginBottom: "16px" }}>
        <Descriptions column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Avatar">
            <Avatar
              size={64}
              src={avatarUrl}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}>
              {employeeName?.charAt(0)}
            </Avatar>
          </Descriptions.Item>
          <Descriptions.Item label="Tên nhân viên">
            {employeeName}
          </Descriptions.Item>
          <Descriptions.Item label="Username">{username}</Descriptions.Item>
          <Descriptions.Item label="Email">{email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {phoneNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={isActive ? "success" : "default"}>
              {isActive ? "Hoạt động" : "Vô hiệu"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày vào làm">
            {fmtDate(hireDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Lương cơ bản">
            {fmtMoney(baseSalary)} ₫
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {fmtDateTime(createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật">
            {fmtDateTime(updatedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {address || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa nhân viên"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="employeeName"
            label="Tên nhân viên"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhân viên" },
            ]}>
            <Input placeholder="Nhập tên nhân viên" />
          </Form.Item>

          <Form.Item label="Email">
            <Input
              value={email}
              disabled
              placeholder="Email không thể thay đổi"
            />
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
            label="Mật khẩu mới (để trống nếu không đổi)">
            <Input.Password placeholder="Nhập mật khẩu mới" />
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
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeDetail;
