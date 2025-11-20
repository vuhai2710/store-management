import React from "react";
import { Tag, Badge } from "antd";

/**
 * StatusBadge Component
 * Displays status with appropriate color and icon
 * 
 * @param {Object} props
 * @param {string} props.status - Status value
 * @param {Object} props.statusMap - Status mapping object { STATUS: { text, color, icon } }
 * @param {string} props.type - Display type: 'tag' | 'badge' (default: 'tag')
 */
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

