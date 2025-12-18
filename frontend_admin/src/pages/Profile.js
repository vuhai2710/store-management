import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Avatar,
  Button,
  Space,
  Tag,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Upload,
  Typography,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  CameraOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { authService } from "../services/authService";
import { employeesService } from "../services/employeesService";
import { customersService } from "../services/customersService";
import { setUser } from "../store/slices/authSlice";
import { USER_ROLES } from "../constants/roles";

const { Title, Text } = Typography;

const Profile = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isViewAvatarModalVisible, setIsViewAvatarModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const userData = await authService.getCurrentUser();
      console.log("User data:", userData);

      let detailedData = null;
      if (userData.role === USER_ROLES.EMPLOYEE) {
        try {
          detailedData = await employeesService.getMyProfile();
          console.log("Employee data:", detailedData);
        } catch (err) {
          console.warn("Could not fetch employee details:", err);
        }
      } else if (userData.role === USER_ROLES.CUSTOMER) {
        try {
          detailedData = await customersService.getMyCustomerInfo();
          console.log("Customer data:", detailedData);
        } catch (err) {
          console.warn("Could not fetch customer details:", err);
        }
      }

      setProfile({
        ...userData,
        ...(detailedData || {}),
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin profile:", error);
      message.error("Không thể lấy thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "Quản trị viên";
      case USER_ROLES.EMPLOYEE:
        return "Nhân viên";
      case USER_ROLES.CUSTOMER:
        return "Khách hàng";
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "red";
      case USER_ROLES.EMPLOYEE:
        return "blue";
      case USER_ROLES.CUSTOMER:
        return "green";
      default:
        return "default";
    }
  };

  const handleEdit = () => {
    const role = profile?.role;
    const formValues = {
      email: profile?.email,
    };

    if (role === USER_ROLES.EMPLOYEE) {
      formValues.employeeName = profile?.employeeName;
      formValues.phoneNumber = profile?.phoneNumber;
      formValues.address = profile?.address;
    } else if (role === USER_ROLES.CUSTOMER) {
      formValues.customerName = profile?.customerName || profile?.name;
      formValues.phoneNumber = profile?.phoneNumber || profile?.phone;
      formValues.address = profile?.address;
    }

    form.setFieldsValue(formValues);
    setIsEditModalVisible(true);
  };

  const handleUpdateProfile = async (values) => {
    try {
      const role = profile?.role;
      let response = null;

      if (role === USER_ROLES.ADMIN) {

        if (!profile?.idUser) {
          message.error("Không tìm thấy thông tin người dùng");
          return;
        }
        response = await authService.updateProfile(profile.idUser, {
          email: values.email,
        });
      } else if (role === USER_ROLES.EMPLOYEE) {

        response = await employeesService.updateMyProfile({
          employeeName: values.employeeName,
          phoneNumber: values.phoneNumber,
          address: values.address,

        });
      } else if (role === USER_ROLES.CUSTOMER) {

        response = await customersService.updateMyCustomerInfo({
          customerName: values.customerName,
          phoneNumber: values.phoneNumber,
          address: values.address,

        });
      } else {
        message.error("Không xác định được vai trò người dùng");
        return;
      }

      if (response?.data) {

        const updatedUser = response.data;

        dispatch(setUser({
          ...profile,
          ...updatedUser,
        }));
      }

      message.success("Cập nhật thông tin thành công");
      setIsEditModalVisible(false);
      fetchProfile();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Cập nhật thông tin thất bại";
      message.error(errorMessage);
      console.error("Error updating profile:", error);
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatarUrl) {
      if (profile.avatarUrl.startsWith('http://') || profile.avatarUrl.startsWith('https://')) {
        return profile.avatarUrl;
      }
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${profile.avatarUrl}`;
    }
    return null;
  };

  const handleAvatarClick = () => {
    if (getAvatarUrl()) {
      setIsViewAvatarModalVisible(true);
    } else {
      setIsAvatarModalVisible(true);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const response = await authService.updateAvatar(file);

      const updatedUser = response?.data || response;
      if (updatedUser) {

        dispatch(setUser(updatedUser));

        localStorage.setItem('user', JSON.stringify(updatedUser));

        await fetchProfile();
        message.success('Cập nhật ảnh đại diện thành công!');
        setIsAvatarModalVisible(false);
      }
      return false;
    } catch (error) {
      message.error(error?.response?.data?.message || 'Cập nhật ảnh đại diện thất bại!');
      return false;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 260,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: "8px 0" }}>
        <Card
          style={{
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <Text>Không tìm thấy thông tin người dùng</Text>
        </Card>
      </div>
    );
  }

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
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 4,
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            Thông tin cá nhân
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Xem và cập nhật hồ sơ tài khoản của bạn tại TechStore
          </Text>
        </div>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={handleEdit}
          style={{
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
          }}
        >
          Chỉnh sửa
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          background: "#FFFFFF",
        }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleAvatarClick}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={getAvatarUrl()}
              style={{ border: '2px solid #1890ff' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#1890ff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
            }}>
              {getAvatarUrl() ? <EyeOutlined /> : <CameraOutlined />}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID">{profile.idUser}</Descriptions.Item>
              <Descriptions.Item label="Tên đăng nhập">
                {profile.username}
              </Descriptions.Item>
              {profile?.role === USER_ROLES.EMPLOYEE && profile?.employeeName && (
                <Descriptions.Item label="Tên nhân viên">
                  {profile.employeeName}
                </Descriptions.Item>
              )}
              {profile?.role === USER_ROLES.CUSTOMER && (profile?.customerName || profile?.name) && (
                <Descriptions.Item label="Tên khách hàng">
                  {profile.customerName || profile.name}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Email" icon={<MailOutlined />}>
                {profile.email || "Chưa cập nhật"}
              </Descriptions.Item>
              {(profile?.phoneNumber || profile?.phone) && (
                <Descriptions.Item label="Số điện thoại" icon={<PhoneOutlined />}>
                  {profile.phoneNumber || profile.phone}
                </Descriptions.Item>
              )}
              {profile?.address && (
                <Descriptions.Item label="Địa chỉ" icon={<HomeOutlined />}>
                  {profile.address}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Vai trò">
                <Tag color={getRoleColor(profile.role)}>
                  {getRoleText(profile.role)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={profile.isActive ? "success" : "error"}>
                  {profile.isActive ? "Hoạt động" : "Ngưng hoạt động"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" icon={<CalendarOutlined />}>
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleString("vi-VN")
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>

      { }
      <Modal
        title="Chỉnh sửa thông tin"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}>
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          {profile?.role === USER_ROLES.ADMIN && (
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}>
              <Input prefix={<MailOutlined />} />
            </Form.Item>
          )}

          {profile?.role === USER_ROLES.EMPLOYEE && (
            <>
              <Form.Item
                name="employeeName"
                label="Tên nhân viên"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nhân viên" },
                ]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^0\d{9,10}$/, message: "Số điện thoại không hợp lệ (10-11 chữ số, bắt đầu bằng 0)" },
                ]}>
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
              <Form.Item
                name="address"
                label="Địa chỉ">
                <Input prefix={<HomeOutlined />} />
              </Form.Item>
            </>
          )}

          {profile?.role === USER_ROLES.CUSTOMER && (
            <>
              <Form.Item
                name="customerName"
                label="Tên khách hàng"
                rules={[
                  { required: true, message: "Vui lòng nhập tên khách hàng" },
                ]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^0\d{9,10}$/, message: "Số điện thoại không hợp lệ (10-11 chữ số, bắt đầu bằng 0)" },
                ]}>
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
              <Form.Item
                name="address"
                label="Địa chỉ">
                <Input prefix={<HomeOutlined />} />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      { }
      <Modal
        title="Ảnh đại diện"
        open={isViewAvatarModalVisible}
        onCancel={() => setIsViewAvatarModalVisible(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            setIsViewAvatarModalVisible(false);
            setIsAvatarModalVisible(true);
          }}>
            Sửa ảnh
          </Button>,
          <Button key="close" onClick={() => setIsViewAvatarModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={400}
      >
        {getAvatarUrl() ? (
          <img
            src={getAvatarUrl()}
            alt="Avatar"
            style={{ width: '100%', height: 'auto' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Avatar size={120} icon={<UserOutlined />} />
            <p style={{ marginTop: 16 }}>Chưa có ảnh đại diện</p>
          </div>
        )}
      </Modal>

      { }
      <Modal
        title="Sửa ảnh đại diện"
        open={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        footer={null}
      >
        <Upload
          beforeUpload={handleAvatarUpload}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<CameraOutlined />} block>
            Chọn ảnh để tải lên
          </Button>
        </Upload>
        {getAvatarUrl() && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p>Ảnh hiện tại:</p>
            <img
              src={getAvatarUrl()}
              alt="Current Avatar"
              style={{ maxWidth: '200px', maxHeight: '200px', marginTop: 8 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
