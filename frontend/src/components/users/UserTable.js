import React from "react";
import { Table, Tag, Button, Space, Popconfirm, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UnlockOutlined,
  LockOutlined,
  ReloadOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

const ROLE_LABELS = {
  ADMIN: "Quản trị",
  EMPLOYEE: "Nhân viên",
  CUSTOMER: "Khách hàng",
};

const roleColor = (role) => {
  switch (role) {
    case "ADMIN":
      return "red";
    case "EMPLOYEE":
      return "blue";
    case "CUSTOMER":
      return "green";
    default:
      return "default";
  }
};

const UserTable = ({
  data,
  loading,
  pagination,
  onChange,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRefresh,
}) => {
  const columns = [
    { title: "ID", dataIndex: "idUser", sorter: true, width: 80, align: "center", fixed: "left" },
    {
      title: "Username",
      dataIndex: "username",
      sorter: true,
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
      width: 260,
      ellipsis: true,
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      width: 140,
      render: (role) => <Tag color={roleColor(role)}>{ROLE_LABELS[role] || role}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: 140,
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Vô hiệu", value: false },
      ],
      render: (isActive) => <Tag color={isActive ? "green" : "volcano"}>{isActive ? "Hoạt động" : "Vô hiệu"}</Tag>,
    },
    { title: "Ngày tạo", dataIndex: "createdAt", width: 140 },
    {
      title: "Hành động",
      key: "actions",
      width: 260,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="Sửa">
            <Button size="small" shape="circle" icon={<EditOutlined />} onClick={() => onEdit?.(record)} />
          </Tooltip>

          {record.isActive ? (
            <Tooltip title="Vô hiệu hóa">
              <Popconfirm title="Vô hiệu hóa người dùng?" onConfirm={() => onDeactivate?.(record)}>
                <Button size="small" danger shape="circle" icon={<LockOutlined />} />
              </Popconfirm>
            </Tooltip>
          ) : (
            <Tooltip title="Kích hoạt">
              <Popconfirm title="Kích hoạt người dùng?" onConfirm={() => onActivate?.(record)}>
                <Button size="small" type="primary" shape="circle" icon={<UnlockOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}

          <Tooltip title="Đổi vai trò nhanh">
            <Button size="small" shape="circle" icon={<UserSwitchOutlined />} onClick={() => onEdit?.(record)} />
          </Tooltip>

          <Tooltip title="Xóa">
            <Popconfirm title="Xóa người dùng này?" okButtonProps={{ danger: true }} onConfirm={() => onDelete?.(record)}>
              <Button size="small" danger shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 12 }}>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Tải lại
        </Button>
      </div>
      <Table
        rowKey="idUser"
        columns={columns}
        dataSource={Array.isArray(data) ? data : []}
        loading={loading}
        pagination={pagination}
        onChange={onChange}
        size="middle"
        scroll={{ x: "max-content" }} // kéo ngang, không ẩn cột nào
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default UserTable;