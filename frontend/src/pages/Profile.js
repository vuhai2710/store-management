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
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { authService } from "../services/authService";
import { USER_ROLES } from "../constants/roles";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      console.log("Profile data:", data);
      setProfile(data);
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
    form.setFieldsValue({
      email: profile?.email,
      // Có thể thêm các trường khác nếu backend hỗ trợ
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateProfile = async (values) => {
    try {
      // TODO: Implement update profile API
      message.success("Cập nhật thông tin thành công");
      setIsEditModalVisible(false);
      fetchProfile();
    } catch (error) {
      message.error("Cập nhật thông tin thất bại");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <p>Không tìm thấy thông tin người dùng</p>
      </Card>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Thông tin cá nhân</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            Chỉnh sửa
          </Button>
        }>
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          <Avatar size={120} icon={<UserOutlined />} />
          <div style={{ flex: 1 }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID">{profile.idUser}</Descriptions.Item>
              <Descriptions.Item label="Tên đăng nhập">
                {profile.username}
              </Descriptions.Item>
              <Descriptions.Item label="Email" icon={<MailOutlined />}>
                {profile.email || "Chưa cập nhật"}
              </Descriptions.Item>
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

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}>
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}>
            <Input prefix={<MailOutlined />} />
          </Form.Item>

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
    </div>
  );
};

export default Profile;
