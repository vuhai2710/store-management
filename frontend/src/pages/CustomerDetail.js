import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Descriptions,
  Table,
  Tag,
  Button,
  Avatar,
  Modal,
  message,
  Space,
  Popconfirm,
} from "antd";
import { EditOutlined, UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerById,
  deleteCustomer,
} from "../store/slices/customersSlice";
import CustomerForm from "../components/customers/CustomerForm";

const { Title } = Typography;

const CustomerDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCustomer, loading } = useSelector((state) => state.customers);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    message.success("Cập nhật khách hàng thành công!");
    // Reload customer data
    dispatch(fetchCustomerById(id));
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCustomer(id)).unwrap();
      message.success("Xóa khách hàng thành công!");
      // Redirect to customers list
      navigate("/customers");
    } catch (error) {
      message.error("Xóa khách hàng thất bại!");
    }
  };

  const orderColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `${amount?.toLocaleString("vi-VN")} VNĐ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "success" : "processing"}>
          {status === "completed" ? "Hoàn thành" : "Đang xử lý"}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentCustomer) {
    return <div>Không tìm thấy khách hàng</div>;
  }

  return (
    <div>
      <div className="page-header">
        <Title level={1}>Thông tin khách hàng</Title>
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            Chỉnh sửa
          </Button>
          <Popconfirm
            title="Xóa khách hàng"
            description="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card title="Thông tin cá nhân" style={{ marginBottom: "16px" }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Avatar">
            <Avatar
              size={64}
              src={currentCustomer.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}>
              {currentCustomer.name?.charAt(0)}
            </Avatar>
          </Descriptions.Item>
          <Descriptions.Item label="Tên khách hàng">
            {currentCustomer.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {currentCustomer.email}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {currentCustomer.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {currentCustomer.address || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Loại khách hàng">
            <Tag
              color={
                currentCustomer.customerType?.toUpperCase() === "VIP"
                  ? "gold"
                  : "blue"
              }>
              {currentCustomer.customerType?.toUpperCase() === "VIP"
                ? "VIP"
                : "REGULAR"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(currentCustomer.createdAt).toLocaleDateString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(currentCustomer.updatedAt).toLocaleDateString("vi-VN")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Lịch sử đơn hàng">
        <Table
          columns={orderColumns}
          dataSource={currentCustomer.orders || []}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Edit Customer Modal */}
      <Modal
        title="Chỉnh sửa khách hàng"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose>
        <CustomerForm
          customer={currentCustomer}
          onSuccess={handleEditSuccess}
        />
      </Modal>
    </div>
  );
};

export default CustomerDetail;
