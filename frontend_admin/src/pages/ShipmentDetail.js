import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Descriptions,
  Space,
  Button,
  message,
  Spin,
  Tag,
} from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchShipmentById, syncShipmentWithGHN, trackShipment } from "../store/slices/shipmentsSlice";
import ShipmentTracking from "../components/shipments/ShipmentTracking";

const { Title, Text } = Typography;

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentShipment, loading } = useSelector((state) => state.shipments);

  useEffect(() => {
    if (id) {
      dispatch(fetchShipmentById(Number(id)));
      dispatch(trackShipment(Number(id)));
    }
  }, [dispatch, id]);

  const handleSyncGHN = async () => {
    if (!id) return;
    try {
      await dispatch(syncShipmentWithGHN(Number(id))).unwrap();
      message.success("Đồng bộ với GHN thành công!");
      dispatch(fetchShipmentById(Number(id)));
      dispatch(trackShipment(Number(id)));
    } catch (error) {
      message.error(error || "Đồng bộ với GHN thất bại!");
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    const statusUpper = status?.toUpperCase();
    if (statusUpper === "DELIVERED" || statusUpper.includes("DELIVERED")) {
      return "green";
    } else if (statusUpper === "SHIPPED" || statusUpper.includes("SHIPPED") || statusUpper.includes("DELIVERING")) {
      return "blue";
    } else if (statusUpper === "PREPARING" || statusUpper.includes("PREPARING") || statusUpper.includes("PICKING")) {
      return "orange";
    } else if (statusUpper.includes("FAIL") || statusUpper.includes("CANCEL") || statusUpper.includes("EXCEPTION")) {
      return "red";
    }
    return "default";
  };

  const getStatusText = (status) => {
    if (!status) return "N/A";
    const statusMap = {
      PREPARING: "Chuẩn bị",
      SHIPPED: "Đã gửi",
      DELIVERED: "Đã giao",
      ready_to_pick: "Sẵn sàng lấy hàng",
      picking: "Đang lấy hàng",
      picked: "Đã lấy hàng",
      storing: "Đang lưu kho",
      transporting: "Đang vận chuyển",
      sorting: "Đang phân loại",
      delivering: "Đang giao hàng",
      delivered: "Đã giao hàng",
      delivery_fail: "Giao hàng thất bại",
    };
    return statusMap[status] || status;
  };

  if (loading && !currentShipment) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentShipment) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/orders")}>
          Quay lại
        </Button>
        <Card style={{ marginTop: "16px" }}>
          <Text>Không tìm thấy vận đơn</Text>
        </Card>
      </div>
    );
  }

  const shipmentId = currentShipment.idShipment || id;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "16px" }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/orders")}>
            Quay lại
          </Button>
          <Title level={1} style={{ margin: 0 }}>
            Chi tiết vận đơn #{shipmentId}
          </Title>
        </Space>
        <Space style={{ marginTop: "16px" }}>
          <Button icon={<ReloadOutlined />} onClick={handleSyncGHN}>
            Đồng bộ GHN
          </Button>
        </Space>
      </div>

      <Card title="Thông tin vận đơn" style={{ marginBottom: "16px" }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã vận đơn">
            <Text strong>#{shipmentId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mã đơn hàng">
            {currentShipment.idOrder ? (
              <Button
                type="link"
                onClick={() => navigate(`/orders/${currentShipment.idOrder}`)}
              >
                #{currentShipment.idOrder}
              </Button>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Mã đơn GHN">
            {currentShipment.ghnOrderCode || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái vận chuyển">
            <Tag color={getStatusColor(currentShipment.shippingStatus)}>
              {getStatusText(currentShipment.shippingStatus)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái GHN">
            <Tag color={getStatusColor(currentShipment.ghnStatus)}>
              {getStatusText(currentShipment.ghnStatus)}
            </Tag>
          </Descriptions.Item>
          {(currentShipment.receiverName || currentShipment.receiverPhone || currentShipment.shippingAddress) && (
            <>
              <Descriptions.Item label="Người nhận">
                {currentShipment.receiverName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {currentShipment.receiverPhone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                {currentShipment.shippingAddress || "N/A"}
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="Phí vận chuyển">
            {(currentShipment.shippingFee || currentShipment.ghnShippingFee)
              ? `${Number(currentShipment.shippingFee || currentShipment.ghnShippingFee).toLocaleString("vi-VN")} VNĐ`
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian giao hàng dự kiến">
            {currentShipment.ghnExpectedDeliveryTime
              ? new Date(currentShipment.ghnExpectedDeliveryTime).toLocaleString("vi-VN")
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {currentShipment.createdAt
              ? new Date(currentShipment.createdAt).toLocaleString("vi-VN")
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối (GHN)">
            {currentShipment.ghnUpdatedAt
              ? new Date(currentShipment.ghnUpdatedAt).toLocaleString("vi-VN")
              : "N/A"}
          </Descriptions.Item>
          {currentShipment.ghnNote && (
            <Descriptions.Item label="Ghi chú GHN" span={2}>
              {currentShipment.ghnNote}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <ShipmentTracking shipmentId={Number(id)} />
    </div>
  );
};

export default ShipmentDetail;
