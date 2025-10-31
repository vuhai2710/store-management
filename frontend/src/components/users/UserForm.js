import React, { useEffect } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";
import { useDispatch } from "react-redux";
import { changeUserRole, fetchUsers, updateUser } from "../../store/slices/usersSlice";

const { Option } = Select;

const UserForm = ({ open, onClose, user }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const promises = [];
      if (user.email !== values.email || user.isActive !== values.isActive) {
        promises.push(dispatch(updateUser({ id: user.idUser, userData: { email: values.email, isActive: values.isActive } })));
      }
      if (user.role !== values.role) {
        promises.push(dispatch(changeUserRole({ id: user.idUser, role: values.role })));
      }
      await Promise.all(promises);
      dispatch(fetchUsers({}));
      onClose?.();
    } catch {}
  };

  return (
    <Modal open={open} title={`Cập nhật người dùng: ${user?.username || ""}`} onCancel={onClose} onOk={handleSubmit} okText="Lưu" cancelText="Hủy" destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item label="Username">
          <Input value={user?.username} disabled />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
          <Input placeholder="example@gmail.com" />
        </Form.Item>
        <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
          <Select>
            <Option value="ADMIN">Quản trị</Option>
            <Option value="EMPLOYEE">Nhân viên</Option>
            <Option value="CUSTOMER">Khách hàng</Option>
          </Select>
        </Form.Item>
        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;