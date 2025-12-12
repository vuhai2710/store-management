import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Typography,
  Modal,
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCustomers,
  deleteCustomer,
  setPagination,
} from "../store/slices/customersSlice";
import CustomerForm from "../components/customers/CustomerForm";
import { exportToExcel, exportToCSV } from "../utils/exportUtils";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import { formatDate } from "../utils/formatUtils";
import { useDebounce } from "../hooks";

const { Title, Text } = Typography;
const { Option } = Select;

const Customers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers, loading, pagination } = useSelector(
    (state) => state.customers
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState(null);

  // Debounced search keyword for realtime search
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  useEffect(() => {
    const params = {
      pageNo: pagination.current || 1,
      pageSize: pagination.pageSize || 5, // Default page size: 5
      sortBy: "idCustomer",
      sortDirection: "ASC",
    };

    // If filtering by type, add customerType to params
    if (customerTypeFilter) {
      params.customerType = customerTypeFilter;
    }

    // Add search keyword if exists
    if (debouncedKeyword) {
      params.keyword = debouncedKeyword;
    }

    dispatch(fetchCustomers(params));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    pagination.current,
    pagination.pageSize,
    debouncedKeyword,
    customerTypeFilter,
  ]);

  // Reset page when keyword changes
  useEffect(() => {
    dispatch(setPagination({ current: 1, pageSize: pagination.pageSize }));
  }, [debouncedKeyword, dispatch, pagination.pageSize]);

  const handleTableChange = (newPagination, filters, sorter) => {
    dispatch(
      setPagination({
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      })
    );
  };

  const handleCustomerTypeFilter = (value) => {
    setCustomerTypeFilter(value);
    dispatch(setPagination({ current: 1, pageSize: pagination.pageSize }));
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setCustomerTypeFilter(null);
    dispatch(setPagination({ current: 1, pageSize: pagination.pageSize }));
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(
        customers,
        `khach-hang-${new Date().toISOString().split("T")[0]}`,
        columns
      );
      message.success("Xuất file Excel thành công!");
    } catch (error) {
      message.error("Xuất file Excel thất bại!");
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(
        customers,
        `khach-hang-${new Date().toISOString().split("T")[0]}`,
        columns
      );
      message.success("Xuất file CSV thành công!");
    } catch (error) {
      message.error("Xuất file CSV thất bại!");
    }
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setIsModalVisible(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsModalVisible(true);
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await dispatch(deleteCustomer(customerId)).unwrap();
      message.success("Xóa khách hàng thành công!");
      // Reload data after delete
      if (customerTypeFilter) {
        dispatch(fetchCustomers({ customerType: customerTypeFilter }));
      } else {
        const params = {
          pageNo: pagination.current || 1,
          pageSize: pagination.pageSize || 10,
          sortBy: "idCustomer",
          sortDirection: "ASC",
        };
        if (debouncedKeyword) params.keyword = debouncedKeyword;
        dispatch(fetchCustomers(params));
      }
    } catch (error) {
      message.error("Xóa khách hàng thất bại!");
    }
  };

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: 60,
      render: (avatar, record) => (
        <Avatar
          src={avatar}
          icon={<UserOutlined />}
          style={{ backgroundColor: "#2563EB" }}>
          {(record.name || record.customerName)?.charAt(0)?.toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Text strong>{text || record.customerName || "N/A"}</Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "N/A",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text, record) => text || record.phoneNumber || "N/A",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (text) => text || "N/A",
    },
    {
      title: "Loại khách hàng",
      dataIndex: "customerType",
      key: "customerType",
      render: (type) => {
        if (!type) return <Tag>N/A</Tag>;
        const typeUpper = String(type).toUpperCase();
        return (
          <Tag color={typeUpper === "VIP" ? "gold" : "blue"}>
            {typeUpper === "VIP" ? "VIP" : "REGULAR"}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date, "DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewCustomer(record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCustomer(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => handleDeleteCustomer(record.id)}
            okText="Xóa"
            cancelText="Hủy">
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      <div
        className="page-header"
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 4,
              fontWeight: 700,
              color: "#0F172A",
            }}>
            Quản lý khách hàng
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản lý hồ sơ và phân loại khách hàng TechStore
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateCustomer}
          style={{
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
          }}>
          Thêm khách hàng
        </Button>
      </div>

      <Card
        className="table-container"
        style={{
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          background: "#FFFFFF",
        }}
        bodyStyle={{ padding: 16 }}>
        {/* Filters */}
        <div
          className="table-toolbar"
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}>
          <Space
            wrap
            style={{
              display: "flex",
              gap: 8,
            }}>
            <Input
              placeholder="Tìm tên, SĐT, email..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              style={{ width: 280, maxWidth: "100%" }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Loại khách hàng"
              style={{ width: 170 }}
              allowClear
              onChange={handleCustomerTypeFilter}
              value={customerTypeFilter}>
              <Option value="REGULAR">REGULAR</Option>
              <Option value="VIP">VIP</Option>
            </Select>
            <Button onClick={handleResetFilters} icon={<ReloadOutlined />}>
              Đặt lại
            </Button>
          </Space>
          <Space
            wrap
            style={{
              display: "flex",
              gap: 8,
            }}>
            <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
              Xuất CSV
            </Button>
          </Space>
        </div>

        {/* Table */}
        {loading && (!customers || customers.length === 0) ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : (
          <Table
            columns={columns}
            dataSource={customers}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize || 5,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50", "100"],
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} khách hàng`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            locale={{
              emptyText: (
                <EmptyState
                  description="Chưa có khách hàng nào"
                  actionText="Thêm khách hàng"
                  showAction
                  onAction={handleCreateCustomer}
                />
              ),
            }}
            size="middle"
          />
        )}
      </Card>

      {/* Customer Form Modal */}
      <Modal
        title={editingCustomer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose>
        <CustomerForm
          customer={editingCustomer}
          onSuccess={() => {
            setIsModalVisible(false);
            if (customerTypeFilter) {
              dispatch(fetchCustomers({ customerType: customerTypeFilter }));
            } else {
              const params = {
                pageNo: pagination.current || 1,
                pageSize: pagination.pageSize || 10,
                sortBy: "idCustomer",
                sortDirection: "ASC",
              };
              if (debouncedKeyword) params.keyword = debouncedKeyword;
              dispatch(fetchCustomers(params));
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default Customers;
