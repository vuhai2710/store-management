import React from "react";
import { List, Typography, Tag, Button, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { deleteNotification, markNotificationAsRead } from "../../store/slices/notificationsSlice";

const { Text } = Typography;

const NotificationItem = ({ notification, onRead }) => {
  const dispatch = useDispatch();

  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      try {
        await dispatch(markNotificationAsRead(notification.idNotification)).unwrap();
        onRead && onRead();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await dispatch(deleteNotification(notification.idNotification)).unwrap();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationTypeColor = (type) => {
    if (!type) return "default";
    const typeStr = typeof type === "string" ? type : type.toString();
    const typeMap = {
      ORDER: "blue",
      INVENTORY: "orange",
      SYSTEM: "purple",
      PAYMENT: "green",
      SHIPMENT: "cyan",
    };
    return typeMap[typeStr] || "default";
  };

  const getNotificationTypeText = (type) => {
    if (!type) return "";
    const typeStr = typeof type === "string" ? type : type.toString();
    const typeMap = {
      ORDER: "Đơn hàng",
      INVENTORY: "Kho hàng",
      SYSTEM: "Hệ thống",
      PAYMENT: "Thanh toán",
      SHIPMENT: "Vận chuyển",
    };
    return typeMap[typeStr] || typeStr;
  };

  return (
    <List.Item
      style={{
        cursor: notification.isRead ? "default" : "pointer",
        backgroundColor: notification.isRead ? "#fff" : "#f0f7ff",
        padding: "12px 16px",
        borderBottom: "1px solid #f0f0f0",
      }}
      onClick={handleMarkAsRead}
      actions={[
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          danger
        />,
      ]}
    >
      <List.Item.Meta
        title={
          <Space>
            <Text strong={!notification.isRead}>{notification.title}</Text>
            {!notification.isRead && <Tag color="blue">Mới</Tag>}
            {notification.notificationType && (
              <Tag color={getNotificationTypeColor(notification.notificationType)}>
                {getNotificationTypeText(notification.notificationType)}
              </Tag>
            )}
          </Space>
        }
        description={
          <div>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              {notification.message || notification.title || ""}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {notification.createdAt
                ? new Date(notification.createdAt).toLocaleString("vi-VN")
                : ""}
            </Text>
          </div>
        }
      />
    </List.Item>
  );
};

export default NotificationItem;

