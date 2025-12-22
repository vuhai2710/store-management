import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Typography,
  Modal,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchSuppliersPaginated,
  deleteSupplier,
} from "../store/slices/suppliersSlice";
import SupplierForm from "../components/suppliers/SupplierForm";
import { exportToExcel, exportToCSV } from "../utils/exportUtils";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import { usePagination } from "../hooks/usePagination";
import { useDebounce } from "../hooks/useDebounce";

const { Title, Text } = Typography;

const Suppliers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suppliers, loading, pagination } = useSelector(
    (state) => state.suppliers
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  const {
    currentPage,
    pageSize,
    setTotal,
    handlePageChange,
    resetPagination,
    pagination: tablePagination,
  } = usePagination(1, 10);

  const fetchList = useCallback(() => {
    dispatch(
      fetchSuppliersPaginated({
        pageNo: currentPage,
        pageSize,
        sortBy: "idSupplier",
        sortDirection: "ASC",
        keyword: debouncedKeyword?.trim() || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, debouncedKeyword]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setTotal(pagination?.totalElements || 0);
  }, [pagination?.totalElements, setTotal]);

  useEffect(() => {
    if (debouncedKeyword !== undefined) {
      resetPagination();
    }

  }, [debouncedKeyword]);

  const handleResetFilters = () => {
    setSearchKeyword("");
    resetPagination();
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setIsModalVisible(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalVisible(true);
  };

  const handleDeleteSupplier = async (idSupplier) => {
    try {
      await dispatch(deleteSupplier(idSupplier)).unwrap();
      message.success("Xóa nhà cung cấp thành công!");
    } catch (error) {
      message.error(error || "Xóa nhà cung cấp thất bại!");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "idSupplier", key: "idSupplier", width: 80 },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "supplierName",
      key: "supplierName",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/suppliers/${record.idSupplier}`)}
          style={{ padding: 0 }}>
          <Text strong>{text}</Text>
        </Button>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
    { title: "Địa chỉ", dataIndex: "address", key: "address", ellipsis: true },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/suppliers/${record.idSupplier}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditSupplier(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
            onConfirm={() => handleDeleteSupplier(record.idSupplier)}
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

  const handleExportExcel = () => {
    if (!suppliers || suppliers.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }
    try {
      exportToExcel(
        suppliers,
        `nha-cung-cap-${new Date().toISOString().split("T")[0]}`,
        columns
      );
      message.success("Xuất file Excel thành công!");
    } catch (error) {
      message.error(error?.message || "Xuất file Excel thất bại!");
    }
  };

  const handleExportCSV = () => {
    if (!suppliers || suppliers.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }
    try {
      exportToCSV(
        suppliers,
        `nha-cung-cap-${new Date().toISOString().split("T")[0]}`,
        columns
      );
      message.success("Xuất file CSV thành công!");
    } catch (error) {
      message.error(error?.message || "Xuất file CSV thất bại!");
    }
  };

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
            Quản lý nhà cung cấp
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản lý thông tin và danh sách nhà cung cấp của Electronics Store
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateSupplier}
          style={{
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
          }}>
          Thêm nhà cung cấp
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
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
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
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
              style={{ width: 320, maxWidth: "100%" }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
              Làm mới
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

        {loading && (!suppliers || suppliers.length === 0) ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : (
          <Table
            columns={columns}
            dataSource={suppliers}
            loading={loading}
            rowKey="idSupplier"
            pagination={{
              current: tablePagination.current,
              pageSize: tablePagination.pageSize,
              total: tablePagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showQuickJumper: true,
              onChange: handlePageChange,
            }}
            locale={{
              emptyText: (
                <EmptyState
                  description="Chưa có nhà cung cấp nào"
                  actionText="Thêm nhà cung cấp"
                  showAction
                  onAction={handleCreateSupplier}
                />
              ),
            }}
            size="middle"
          />
        )}
      </Card>

      <Modal
        title={
          editingSupplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnHidden>
        <SupplierForm
          supplier={editingSupplier}
          onSuccess={() => {
            setIsModalVisible(false);
            fetchList();
          }}
        />
      </Modal>
    </div>
  );
};

export default Suppliers;
