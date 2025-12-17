import React from "react";
import { Modal, Form, Input } from "antd";

const ApproveModal = ({
  visible,
  onCancel,
  onOk,
  loading,
  refundAmount,
  returnData,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      onOk({ ...values, refundAmount });
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const itemsTotal =
    returnData?.items?.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0),
      0
    ) || 0;

  const hasDiscount = Number(returnData?.orderDiscount) > 0;
  const orderTotal = Number(returnData?.orderTotalAmount) || 0;
  const orderDiscount = Number(returnData?.orderDiscount) || 0;
  const discountPercent =
    orderTotal > 0 ? ((orderDiscount / orderTotal) * 100).toFixed(1) : 0;

  return (
    <Modal
      title="Duyệt yêu cầu Đổi/Trả"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Duyệt"
      cancelText="Hủy">
      <Form form={form} layout="vertical">
        <div className="mb-4 p-4 bg-gray-50 rounded border">
          <h4 className="font-medium text-gray-700 mb-3">Chi tiết hoàn tiền</h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền sản phẩm trả:</span>
              <span className="font-medium">
                {itemsTotal.toLocaleString("vi-VN")} VND
              </span>
            </div>

            {hasDiscount && (
              <div className="flex justify-between text-orange-600">
                <span>Giảm giá đơn hàng ({discountPercent}%):</span>
                <span>
                  -{" "}
                  {Math.round(
                    (itemsTotal * orderDiscount) / orderTotal
                  ).toLocaleString("vi-VN")}{" "}
                  VND
                </span>
              </div>
            )}

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-800 font-medium">
                  Số tiền hoàn lại:
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {refundAmount?.toLocaleString("vi-VN")} VND
                </span>
              </div>
            </div>
          </div>
        </div>

        <Form.Item name="noteAdmin" label="Ghi chú">
          <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ApproveModal;
