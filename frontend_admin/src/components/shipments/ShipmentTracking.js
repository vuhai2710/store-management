import React, { useEffect, useState } from "react";
import { Timeline, Card, Typography, Button, Space, Tag, Spin, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { trackShipment, syncShipmentWithGHN } from "../../store/slices/shipmentsSlice";

const { Title, Text } = Typography;

const ShipmentTracking = ({ shipmentId }) => {
  const dispatch = useDispatch();
  const { tracking, loading } = useSelector((state) => state.shipments);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (shipmentId) {
      dispatch(trackShipment(shipmentId));
    }
  }, [dispatch, shipmentId]);

  const handleSyncGHN = async () => {
    if (!shipmentId) return;
    try {
      setSyncing(true);
      await dispatch(syncShipmentWithGHN(shipmentId)).unwrap();
      message.success("Đồng bộ với GHN thành công!");

      dispatch(trackShipment(shipmentId));
    } catch (error) {
      message.error(error || "Đồng bộ với GHN thất bại!");
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes("DELIVERED") || statusUpper.includes("delivered")) {
      return "green";
    } else if (statusUpper.includes("SHIPPED") || statusUpper.includes("delivering") || statusUpper.includes("transporting")) {
      return "blue";
    } else if (statusUpper.includes("PREPARING") || statusUpper.includes("picking") || statusUpper.includes("ready")) {
      return "orange";
    } else if (statusUpper.includes("FAIL") || statusUpper.includes("CANCEL") || statusUpper.includes("exception")) {
      return "red";
    }
    return "default";
  };

  const getStatusText = (status) => {
    if (!status) return status;
    const statusMap = {
      ready_to_pick: "Sẵn sàng lấy hàng",
      picking: "Đang lấy hàng",
      picked: "Đã lấy hàng",
      storing: "Đang lưu kho",
      transporting: "Đang vận chuyển",
      sorting: "Đang phân loại",
      delivering: "Đang giao hàng",
      delivered: "Đã giao hàng",
      delivery_fail: "Giao hàng thất bại",
      return: "Đang trả hàng",
      return_fail: "Trả hàng thất bại",
      exception: "Ngoại lệ",
      damage: "Hàng hóa bị hư hỏng",
      lost: "Hàng hóa bị mất",
      PREPARING: "Chuẩn bị",
      SHIPPED: "Đã gửi",
      DELIVERED: "Đã giao",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!tracking) {
    return (
      <Card>
        <Text type="secondary">Chưa có thông tin tracking</Text>
      </Card>
    );
  }

  const trackingEvents = tracking.tracking || [];
  const currentStatus = tracking.status;

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Theo dõi vận đơn
          </Title>
          <Tag color={getStatusColor(currentStatus)}>{getStatusText(currentStatus)}</Tag>
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={handleSyncGHN}
          loading={syncing}
        >
          Đồng bộ GHN
        </Button>
      }
    >
      {trackingEvents.length > 0 ? (
        <Timeline
          items={trackingEvents.map((event, index) => ({
            color: index === trackingEvents.length - 1 ? "green" : "blue",
            children: (
              <div>
                <Text strong>{getStatusText(event.status)}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {event.time ? new Date(event.time).toLocaleString("vi-VN") : ""}
                </Text>
                {event.location && (
                  <>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {event.location}
                    </Text>
                  </>
                )}
                {event.note && (
                  <>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {event.note}
                    </Text>
                  </>
                )}
              </div>
            ),
          }))}
        />
      ) : (
        <Text type="secondary">Chưa có lịch sử tracking</Text>
      )}
    </Card>
  );
};

export default ShipmentTracking;
