import React from "react";
import { Table, Typography } from "antd";

const { Text } = Typography;

const ReturnItemTable = ({ items }) => {
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (val) => val || "Sản phẩm",
    },
    {
      title: "Số lượng trả",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 140,
      align: "right",
      render: (val) =>
        val != null ? `${Number(val).toLocaleString("vi-VN")} ₫` : "-",
    },
    {
      title: "Thành tiền gốc",
      key: "subtotal",
      width: 140,
      align: "right",
      render: (_, record) => {
        const subtotal = (Number(record.price) || 0) * (record.quantity || 0);
        return `${subtotal.toLocaleString("vi-VN")} ₫`;
      },
    },
    {
      title: "Tiền hoàn",
      dataIndex: "lineRefundAmount",
      key: "lineRefundAmount",
      width: 140,
      align: "right",
      render: (val, record) => {
        const refund =
          val ?? (Number(record.price) || 0) * (record.quantity || 0);
        return (
          <Text strong style={{ color: "#52c41a" }}>
            {Number(refund).toLocaleString("vi-VN")} ₫
          </Text>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={items}
      columns={columns}
      rowKey="idReturnItem"
      pagination={false}
    />
  );
};

export default ReturnItemTable;
