import React, { useEffect, useState } from "react";
import { Popover, List, Button, Empty, Space, Typography, Divider, Spin, Badge } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUnreadNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
} from "../../store/slices/notificationsSlice";
import NotificationItem from "./NotificationItem";

const { Text } = Typography;

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const { unreadList, unreadCount, loading } = useSelector((state) => state.notifications);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fetch unread count on mount
    dispatch(fetchUnreadCount());
    // Poll for unread count every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    // Fetch unread notifications when popover is visible
    if (visible) {
      dispatch(fetchUnreadNotifications({ pageNo: 1, pageSize: 10 }));
    }
  }, [visible, dispatch]);

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      dispatch(fetchUnreadCount());
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationRead = () => {
    dispatch(fetchUnreadCount());
  };

  const content = (
    <div style={{ width: 360, maxHeight: 500, overflowY: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Text strong>Thông báo</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      ) : unreadList.length > 0 ? (
        <List
          dataSource={unreadList}
          renderItem={(notification) => (
            <NotificationItem
              notification={notification}
              onRead={handleNotificationRead}
            />
          )}
        />
      ) : (
        <Empty
          description="Không có thông báo mới"
          style={{ padding: "40px 20px" }}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      placement="bottomRight"
      open={visible}
      onOpenChange={setVisible}
    >
      <Badge count={unreadCount} size="small" offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          size="large"
          style={{ color: "#666" }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationCenter;

