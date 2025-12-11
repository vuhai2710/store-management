import React from "react";
import { Modal, Form, Input } from "antd";

const RejectModal = ({ visible, onCancel, onOk, loading }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Từ chối yêu cầu Đổi/Trả"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okType="danger"
      okText="Từ chối"
      cancelText="Hủy">
      <Form form={form} layout="vertical">
        <Form.Item
          name="noteAdmin"
          label="Lý do từ chối"
          rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}>
          <Input.TextArea rows={4} placeholder="Nhập lý do từ chối yêu cầu" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RejectModal;
