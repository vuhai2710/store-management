import React, { useEffect, useState, useCallback } from "react";
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
import { ordersService } from "../services/ordersService";
import { usePagination } from "../hooks/usePagination";
import { formatCurrency, formatDate } from "../utils/formatUtils";

const { Title } = Typography;

const CustomerDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCustomer, loading } = useSelector((state) => state.customers);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const {
    currentPage,
    pageSize,
    setTotal,
    handlePageChange,
    pagination: ordersPagination,
  } = usePagination(1, 5);

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id));
    }
  }, [dispatch, id]);

  const fetchCustomerOrders = useCallback(async () => {
    if (!id) return;
    try {
      setOrdersLoading(true);
      const res = await ordersService.getOrders({
        pageNo: currentPage,
        pageSize,
        sortBy: "orderDate",
        sortDirection: "DESC",
        customerId: Number(id),
      });
      const list = res?.content || res?.list || [];
      setOrders(list);
      setTotal(res?.totalElements || 0);
    } catch (e) {
      console.error("Failed to load customer orders:", e);
      message.error("Không thể tải lịch sử đơn hàng");
      setOrders([]);
      setTotal(0);
    } finally {
      setOrdersLoading(false);
    }
  }, [id, currentPage, pageSize, setTotal]);

  useEffect(() => {
    fetchCustomerOrders();
  }, [fetchCustomerOrders]);

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    message.success("Cập nhật khách hàng thành công!");

    dispatch(fetchCustomerById(id));
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCustomer(id)).unwrap();
      message.success("Xóa khách hàng thành công!");

      navigate("/customers");
    } catch (error) {
      message.error("Xóa khách hàng thất bại!");
    }
  };

  const orderColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "idOrder",
      key: "idOrder",
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => (date ? formatDate(date) : ""),
    },
    {
      title: "Tổng tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount) => (amount != null ? formatCurrency(amount) : ""),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "COMPLETED" ? "success" : status === "CANCELED" ? "red" : "processing"}>
          {status}
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
          dataSource={orders}
          rowKey="idOrder"
          loading={ordersLoading}
          pagination={ordersPagination}
          onChange={(p) => handlePageChange(p.current, p.pageSize)}
        />
      </Card>

      { }
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
