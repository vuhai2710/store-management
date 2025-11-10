/**
 * Unauthorized Page
 * Hiển thị khi user không có quyền truy cập
 */

import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}>
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" onClick={() => navigate("/dashboard")}>
            Quay về Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default Unauthorized;
