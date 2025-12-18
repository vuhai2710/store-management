import React from "react";
import { Empty, Button } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";

const EmptyState = ({
  description = "Không có dữ liệu",
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  actionText = "Thêm mới",
  onAction,
  showAction = false,
  showReload = false,
  onReload,
  children,
}) => {
  return (
    <Empty
      image={image}
      imageStyle={{
        height: 100,
      }}
      description={
        <div>
          <div style={{ fontSize: "16px", color: "#8c8c8c", marginBottom: "8px" }}>
            {description}
          </div>
          {children}
        </div>
      }
    >
      {(showAction || showReload) && (
        <div style={{ marginTop: "16px" }}>
          {showAction && onAction && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
              {actionText}
            </Button>
          )}
          {showReload && onReload && (
            <Button
              style={{ marginLeft: showAction ? "8px" : "0" }}
              icon={<ReloadOutlined />}
              onClick={onReload}
            >
              Làm mới
            </Button>
          )}
        </div>
      )}
    </Empty>
  );
};

export default EmptyState;
