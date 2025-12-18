import React from "react";
import { Tag, Badge } from "antd";

const StatusBadge = ({ status, statusMap = {}, type = "tag" }) => {
  if (!status) return null;

  const statusUpper = status.toUpperCase();
  const statusInfo = statusMap[statusUpper] || {
    text: status,
    color: "default",
    icon: null,
  };

  if (type === "badge") {
    return (
      <Badge
        status={statusInfo.color}
        text={statusInfo.text}
        style={{ textTransform: "capitalize" }}
      />
    );
  }

  return (
    <Tag color={statusInfo.color} icon={statusInfo.icon}>
      {statusInfo.text}
    </Tag>
  );
};

export default StatusBadge;
