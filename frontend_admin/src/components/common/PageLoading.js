import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

/**
 * PageLoading Component
 * Displays a centered loading spinner for page-level loading states
 */
const PageLoading = ({ tip = "Đang tải..." }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        flexDirection: "column",
      }}
    >
      <Spin
        size="large"
        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
        tip={tip}
      />
    </div>
  );
};

export default PageLoading;


