import React from "react";
import { List, Avatar, Tag, Typography, Empty } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ORDER_STATUS = {
  PENDING: { text: "Chờ xác nhận", color: "warning" },
  CONFIRMED: { text: "Đã xác nhận", color: "processing" },
  COMPLETED: { text: "Hoàn thành", color: "success" },
  CANCELED: { text: "Đã hủy", color: "error" },
};

const RecentOrders = ({ orders = [] }) => {
  const getStatusInfo = (status) => {
    if (!status) return { text: status, color: "default" };
    const statusUpper = status.toUpperCase();
    return ORDER_STATUS[statusUpper] || { text: status, color: "default" };
  };

  if (!orders || orders.length === 0) {
    return <Empty description="Chưa có đơn hàng" />;
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={orders}
      renderItem={(order) => {
        const orderId = order.idOrder || order.id;
        const statusInfo = getStatusInfo(order.status);
        return (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<ShoppingCartOutlined />} />}
              title={
                <div>
                  <Text strong>#{orderId}</Text> - {order.customerName || "N/A"}
                </div>
              }
              description={
                <div>
                  <Text>
                    {order.totalAmount
                      ? `${Number(order.totalAmount).toLocaleString("vi-VN")} VNĐ`
                      : "0 VNĐ"}
                  </Text>
                  <Tag color={statusInfo.color} style={{ marginLeft: 8 }}>
                    {statusInfo.text}
                  </Tag>
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

export default RecentOrders;
