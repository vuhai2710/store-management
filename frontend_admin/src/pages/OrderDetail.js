import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Descriptions,
  Table,
  Tag,
  Space,
  Button,
  Select,
  message,
  Spin,
  Modal,
} from "antd";
import { PrinterOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById, updateOrderStatus } from "../store/slices/ordersSlice";
import { createGHNShipmentForOrder } from "../store/slices/shipmentsSlice";
import { ordersService } from "../services/ordersService";
import { formatDate } from "../utils/formatUtils";

const { Title, Text } = Typography;
const { Option } = Select;

const ORDER_STATUS = {
  PENDING: { text: "Chờ xác nhận", color: "warning" },
  CONFIRMED: { text: "Đã xác nhận", color: "processing" },
  COMPLETED: { text: "Hoàn thành", color: "success" },
  CANCELED: { text: "Đã hủy", color: "error" },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector((state) => state.orders);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [creatingShipment, setCreatingShipment] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(Number(id)));

    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentOrder?.status) {
      setSelectedStatus(currentOrder.status);
    }
  }, [currentOrder]);

  const getStatusInfo = (status) => {
    if (!status) return { text: status, color: "default" };
    const statusUpper = status.toUpperCase();
    return ORDER_STATUS[statusUpper] || { text: status, color: "default" };
  };

  const handleCreateGHNShipment = async () => {
    if (!orderId) return;
    try {
      setCreatingShipment(true);
      const shipment = await dispatch(
        createGHNShipmentForOrder(orderId)
      ).unwrap();
      message.success("Tạo vận đơn GHN thành công!");
      const shipmentId = shipment?.idShipment;
      if (shipmentId) {
        navigate(`/shipments/${shipmentId}`);
      }
    } catch (error) {
      message.error(error || "Tạo vận đơn GHN thất bại!");
    } finally {
      setCreatingShipment(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!currentOrder || !id) return;

    Modal.confirm({
      title: "Xác nhận thay đổi trạng thái",
      content: `Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng từ "${getStatusInfo(currentOrder.status).text
        }" sang "${getStatusInfo(newStatus).text}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setStatusUpdating(true);
          await dispatch(
            updateOrderStatus({ id: Number(id), status: newStatus })
          ).unwrap();
          message.success("Cập nhật trạng thái đơn hàng thành công!");
          setSelectedStatus(newStatus);

          dispatch(fetchOrderById(Number(id)));
        } catch (error) {
          message.error(error || "Cập nhật trạng thái đơn hàng thất bại!");
          setSelectedStatus(currentOrder.status);
        } finally {
          setStatusUpdating(false);
        }
      },
      onCancel: () => {
        setSelectedStatus(currentOrder.status);
      },
    });
  };

  const handlePrintInvoice = async () => {
    if (!id) return;
    try {
      const blob = await ordersService.exportOrderToPdf(Number(id));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hoa-don-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Xuất hóa đơn thành công!");
    } catch (error) {
      message.error("Xuất hóa đơn thất bại!");
    }
  };

  const orderDetailsColumns = [
    {
      title: "Sản phẩm",
      key: "productName",
      render: (record) => {

        return record.productNameSnapshot || record.productName || "N/A";
      },
    },
    {
      title: "Mã sản phẩm",
      key: "productCode",
      render: (record) => {
        return record.productCodeSnapshot || record.productCode || "N/A";
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price) => {
        if (!price) return "N/A";
        return `${Number(price).toLocaleString("vi-VN")} VNĐ`;
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Thành tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      width: 150,
      render: (subtotal, record) => {

        const total =
          subtotal ||
          (record.price && record.quantity
            ? Number(record.price) * record.quantity
            : 0);
        return `${Number(total).toLocaleString("vi-VN")} VNĐ`;
      },
    },
  ];

  if (loading && !currentOrder) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 260,
        }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div style={{ padding: "8px 0" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/orders")}
          style={{ marginBottom: 16 }}>
          Quay lại
        </Button>
        <Card
          style={{
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}>
          <Text>Không tìm thấy đơn hàng</Text>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentOrder.status);
  const orderId = currentOrder.idOrder || currentOrder.id;

  const getAvailableStatuses = () => {
    const current = currentOrder.status?.toUpperCase();
    const paymentMethod = currentOrder.paymentMethod?.toUpperCase();

    if (current === "PENDING") {

      if (paymentMethod === "CASH") {
        return ["COMPLETED", "CANCELED"];
      }

      return ["CONFIRMED", "CANCELED"];
    }

    if (current === "CONFIRMED") {
      return ["COMPLETED"];
    }

    return [];
  };

  const availableStatuses = getAvailableStatuses();

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
        <Space align="center" style={{ gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/orders")}>
            Quay lại
          </Button>
          <div>
            <Title
              level={2}
              style={{
                marginBottom: 4,
                fontWeight: 700,
                color: "#0F172A",
              }}>
              Chi tiết đơn hàng #{orderId}
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Theo dõi trạng thái và chi tiết sản phẩm cho đơn hàng TechStore
            </Text>
          </div>
        </Space>
        <Space
          wrap
          style={{
            display: "flex",
            gap: 8,
          }}>
          {availableStatuses.length > 0 && (
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              loading={statusUpdating}
              style={{ width: 200 }}>
              {availableStatuses.map((status) => {
                const info = getStatusInfo(status);
                return (
                  <Option key={status} value={status}>
                    {info.text}
                  </Option>
                );
              })}
            </Select>
          )}
          {currentOrder.status === "COMPLETED" && (
            <Button
              onClick={handleCreateGHNShipment}
              loading={creatingShipment}>
              Tạo vận đơn GHN
            </Button>
          )}
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrintInvoice}>
            In hóa đơn
          </Button>
        </Space>
      </div>

      <Card
        title="Thông tin đơn hàng"
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
        bodyStyle={{ padding: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Mã đơn hàng">
            <Text strong>#{orderId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {currentOrder.customerName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {currentOrder.customerPhone || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng">
            {currentOrder.shippingAddressSnapshot ||
              currentOrder.customerAddress ||
              "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Nhân viên">
            {currentOrder.employeeName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày đặt hàng">
            {formatDate(currentOrder.orderDate, "DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày giao hàng">
            {currentOrder.deliveredAt
              ? formatDate(currentOrder.deliveredAt, "DD/MM/YYYY HH:mm:ss")
              : "Chưa giao"}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">
            {currentOrder.paymentMethod
              ? currentOrder.paymentMethod === "CASH"
                ? "Tiền mặt"
                : currentOrder.paymentMethod === "PAYOS"
                  ? "PayOS"
                  : currentOrder.paymentMethod === "TRANSFER"
                    ? "Chuyển khoản"
                    : currentOrder.paymentMethod === "ZALOPAY"
                      ? "ZaloPay"
                      : currentOrder.paymentMethod
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            {currentOrder.notes || "Không có"}
          </Descriptions.Item>
        </Descriptions>

        { }
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#fafafa",
            borderRadius: 8,
          }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            Chi tiết thanh toán
          </Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            { }
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text>Tổng tiền sản phẩm:</Text>
              <Text>
                {currentOrder.totalAmount
                  ? `${Number(currentOrder.totalAmount).toLocaleString(
                    "vi-VN"
                  )} VNĐ`
                  : "0 VNĐ"}
              </Text>
            </div>

            { }
            {(currentOrder.promotionCode || currentOrder.promotionName) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#52c41a",
                }}>
                <Text style={{ color: "#52c41a" }}>
                  Mã giảm giá:{" "}
                  {currentOrder.promotionCode || currentOrder.promotionName}
                  {currentOrder.promotionScope === "SHIPPING"
                    ? " (Phí ship)"
                    : ""}
                  {currentOrder.promotionDiscountType === "PERCENTAGE" &&
                    currentOrder.promotionDiscountValue
                    ? ` (-${currentOrder.promotionDiscountValue}%)`
                    : ""}
                </Text>
                <Text style={{ color: "#52c41a" }}>
                  -{Number(currentOrder.discount || 0).toLocaleString("vi-VN")}{" "}
                  VNĐ
                </Text>
              </div>
            )}

            { }
            {!currentOrder.promotionCode &&
              !currentOrder.promotionName &&
              currentOrder.discount &&
              Number(currentOrder.discount) > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#52c41a",
                  }}>
                  <Text style={{ color: "#52c41a" }}>Giảm giá:</Text>
                  <Text style={{ color: "#52c41a" }}>
                    -{Number(currentOrder.discount).toLocaleString("vi-VN")} VNĐ
                  </Text>
                </div>
              )}

            { }
            {currentOrder.shippingFee &&
              Number(currentOrder.shippingFee) > 0 && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary">
                    Phí vận chuyển (không tính vào doanh thu):
                  </Text>
                  <Text type="secondary">
                    {Number(currentOrder.shippingFee).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </Text>
                </div>
              )}

            { }
            <div
              style={{
                borderTop: "1px solid #d9d9d9",
                marginTop: 8,
                paddingTop: 8,
              }}>
              { }
              {currentOrder.shippingFee &&
                Number(currentOrder.shippingFee) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text strong>Thành tiền (doanh thu cửa hàng):</Text>
                    <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                      {currentOrder.finalAmount
                        ? `${(
                          Number(currentOrder.finalAmount) -
                          Number(currentOrder.shippingFee || 0)
                        ).toLocaleString("vi-VN")} VNĐ`
                        : currentOrder.totalAmount
                          ? `${(
                            Number(currentOrder.totalAmount) -
                            Number(currentOrder.discount || 0)
                          ).toLocaleString("vi-VN")} VNĐ`
                          : "0 VNĐ"}
                    </Text>
                  </div>
                )}

              { }
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}>
                <Text strong style={{ fontSize: "16px" }}>
                  {currentOrder.shippingFee && Number(currentOrder.shippingFee) > 0
                    ? "Khách thanh toán (bao gồm ship):"
                    : "Tổng thanh toán:"}
                </Text>
                <Text strong style={{ fontSize: "18px", color: "#fa541c" }}>
                  {currentOrder.finalAmount
                    ? `${Number(currentOrder.finalAmount).toLocaleString(
                      "vi-VN"
                    )} VNĐ`
                    : currentOrder.totalAmount
                      ? `${(
                        Number(currentOrder.totalAmount) -
                        Number(currentOrder.discount || 0) +
                        Number(currentOrder.shippingFee || 0)
                      ).toLocaleString("vi-VN")} VNĐ`
                      : "0 VNĐ"}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Sản phẩm trong đơn hàng"
        style={{
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          marginTop: 16,
        }}
        bodyStyle={{ padding: 16 }}>
        <Table
          columns={orderDetailsColumns}
          dataSource={currentOrder.orderDetails || currentOrder.items || []}
          rowKey={(record) => record.idOrderDetail || record.id}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default OrderDetail;
