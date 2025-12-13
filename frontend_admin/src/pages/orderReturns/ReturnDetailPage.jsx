import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Space, Tag, message, Divider } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAdminReturnService } from "../../hooks/useAdminReturnService";
import ReturnItemTable from "../../components/orderReturns/ReturnItemTable";
import ApproveModal from "../../components/orderReturns/ApproveModal";
import RejectModal from "../../components/orderReturns/RejectModal";

const ReturnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getReturnDetail,
    approveReturn,
    rejectReturn,
    completeReturn,
    loading,
  } = useAdminReturnService();
  const [returnData, setReturnData] = useState(null);

  const [approveVisible, setApproveVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);

  const fetchDetail = async () => {
    try {
      const response = await getReturnDetail(id);
      console.log("Admin return detail response:", response);
      // API interceptor đã unwrap nên response chính là data
      setReturnData(response);
    } catch (error) {
      message.error("Không thể tải thông tin chi tiết");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleApprove = async (values) => {
    try {
      await approveReturn(id, values);
      message.success("Duyệt thành công");
      setApproveVisible(false);
      fetchDetail();
    } catch (error) {
      message.error("Duyệt thất bại");
    }
  };

  const handleReject = async (values) => {
    try {
      await rejectReturn(id, values);
      message.success("Từ chối thành công");
      setRejectVisible(false);
      fetchDetail();
    } catch (error) {
      message.error("Từ chối thất bại");
    }
  };

  const handleComplete = async () => {
    try {
      await completeReturn(id);
      message.success("Hoàn tất thành công");
      fetchDetail();
    } catch (error) {
      message.error("Hoàn tất thất bại");
    }
  };

  /**
   * Tính số tiền hoàn lại cho khách
   * Công thức: itemsTotal * discountRatio
   * - itemsTotal: Tổng tiền các sản phẩm yêu cầu trả (price * quantity)
   * - discountRatio: Tỷ lệ sau giảm giá = (totalAmount - discount) / totalAmount
   * Không tính phí ship vào tiền hoàn
   */
  const calculateRefundAmount = (data) => {
    if (!data || !data.items) return 0;

    // Tính tổng tiền sản phẩm yêu cầu trả
    const itemsTotal = data.items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0),
      0
    );

    // Nếu không có thông tin đơn hàng hoặc không có giảm giá -> hoàn nguyên giá
    const orderTotal = Number(data.orderTotalAmount) || 0;
    const orderDiscount = Number(data.orderDiscount) || 0;

    if (orderTotal <= 0) {
      // Không có thông tin đơn hàng, hoàn nguyên giá sản phẩm
      return Math.round(itemsTotal);
    }

    // Tính tỷ lệ sau giảm giá
    const discountRatio = (orderTotal - orderDiscount) / orderTotal;

    // Số tiền hoàn = tổng tiền sp trả * tỷ lệ giảm giá
    const refundAmount = itemsTotal * discountRatio;

    return Math.round(refundAmount);
  };

  if (!returnData) return <Card loading={true} />;

  return (
    <div className="p-6">
      <Card
        title={`Yêu cầu Đổi/Trả #${returnData.idReturn}`}
        extra={
          <Space>
            {returnData.status === "REQUESTED" && (
              <>
                <Button
                  type="primary"
                  onClick={() => setApproveVisible(true)}
                  icon={<CheckOutlined />}>
                  Duyệt
                </Button>
                <Button
                  danger
                  onClick={() => setRejectVisible(true)}
                  icon={<CloseOutlined />}>
                  Từ chối
                </Button>
              </>
            )}
            {returnData.status === "APPROVED" && (
              <Button
                type="primary"
                style={{ backgroundColor: "#52c41a" }}
                onClick={handleComplete}
                icon={<CheckCircleOutlined />}>
                Hoàn tất
              </Button>
            )}
            <Button onClick={() => navigate("/order-returns")}>Quay lại</Button>
          </Space>
        }>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã đơn hàng">
            {returnData.orderId}
          </Descriptions.Item>
          <Descriptions.Item label="Loại yêu cầu">
            <Tag color={returnData.returnType === "RETURN" ? "blue" : "purple"}>
              {returnData.returnType === "RETURN" ? "Trả hàng" : "Đổi hàng"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag>{returnData.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(returnData.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Mã khách hàng">
            {returnData.createdByCustomerId}
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền hoàn">
            {`${(returnData.refundAmount || 0).toLocaleString("vi-VN")} VND`}
          </Descriptions.Item>
          <Descriptions.Item label="Lý do" span={2}>
            {returnData.reason}
          </Descriptions.Item>
          {returnData.noteAdmin && (
            <Descriptions.Item
              label="Ghi chú Admin"
              span={2}
              style={{ background: "#fffbe6" }}>
              {returnData.noteAdmin}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Order Price Breakdown Section */}
        <Divider orientation="left">Chi tiết đơn hàng gốc</Divider>
        <div
          style={{
            padding: 16,
            background: "#fafafa",
            borderRadius: 8,
            marginBottom: 16,
          }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Original Order Amount */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tổng tiền sản phẩm:</span>
              <span>
                {returnData.orderTotalAmount
                  ? `${Number(returnData.orderTotalAmount).toLocaleString(
                      "vi-VN"
                    )} VNĐ`
                  : "0 VNĐ"}
              </span>
            </div>

            {/* Promotion Info */}
            {(returnData.orderPromotionCode ||
              returnData.orderPromotionName) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#52c41a",
                }}>
                <span style={{ color: "#52c41a" }}>
                  Mã giảm giá:{" "}
                  {returnData.orderPromotionCode ||
                    returnData.orderPromotionName}
                  {returnData.orderPromotionScope === "SHIPPING"
                    ? " (Phí ship)"
                    : ""}
                  {returnData.orderPromotionDiscountType === "PERCENTAGE" &&
                  returnData.orderPromotionDiscountValue
                    ? ` (-${returnData.orderPromotionDiscountValue}%)`
                    : ""}
                </span>
                <span style={{ color: "#52c41a" }}>
                  -
                  {Number(returnData.orderDiscount || 0).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  VNĐ
                </span>
              </div>
            )}

            {/* Discount without promotion code */}
            {!returnData.orderPromotionCode &&
              !returnData.orderPromotionName &&
              returnData.orderDiscount &&
              Number(returnData.orderDiscount) > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#52c41a",
                  }}>
                  <span style={{ color: "#52c41a" }}>Giảm giá:</span>
                  <span style={{ color: "#52c41a" }}>
                    -{Number(returnData.orderDiscount).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </span>
                </div>
              )}

            {/* Shipping Fee */}
            {returnData.orderShippingFee &&
              Number(returnData.orderShippingFee) > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#8c8c8c",
                  }}>
                  <span>Phí vận chuyển (không tính vào hoàn tiền):</span>
                  <span>
                    {Number(returnData.orderShippingFee).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </span>
                </div>
              )}

            {/* Final Amount */}
            <div
              style={{
                borderTop: "1px solid #d9d9d9",
                marginTop: 8,
                paddingTop: 8,
                display: "flex",
                justifyContent: "space-between",
              }}>
              <strong>Thành tiền đơn hàng:</strong>
              <strong style={{ color: "#1890ff" }}>
                {returnData.orderFinalAmount
                  ? `${Number(returnData.orderFinalAmount).toLocaleString(
                      "vi-VN"
                    )} VNĐ`
                  : "0 VNĐ"}
              </strong>
            </div>
          </div>
        </div>

        <Divider orientation="left">Sản phẩm yêu cầu trả</Divider>
        <ReturnItemTable items={returnData.items} />
      </Card>

      <ApproveModal
        visible={approveVisible}
        onCancel={() => setApproveVisible(false)}
        onOk={handleApprove}
        loading={loading}
        refundAmount={calculateRefundAmount(returnData)}
        returnData={returnData}
      />

      <RejectModal
        visible={rejectVisible}
        onCancel={() => setRejectVisible(false)}
        onOk={handleReject}
        loading={loading}
      />
    </div>
  );
};

export default ReturnDetailPage;
