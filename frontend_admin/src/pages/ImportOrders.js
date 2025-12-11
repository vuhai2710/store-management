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
  Tooltip,
  Select,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchImportOrders,
  setFilters,
} from "../store/slices/importOrdersSlice";
import ImportOrderForm from "../components/importOrders/ImportOrderForm";
import { usePagination } from "../hooks/usePagination";
import { importOrderService } from "../services/importOrderService";
import { suppliersService } from "../services/suppliersService";
import dayjs from "dayjs";
import EmptyState from "../components/common/EmptyState";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { exportToExcel, exportToCSV } from "../utils/exportUtils";
import { DownloadOutlined } from "@ant-design/icons";
import { formatDate } from "../utils/formatUtils"; // add

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ImportOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    list: importOrders,
    loading,
    pagination,
    filters,
  } = useSelector((state) => state.importOrders || {});

  const {
    currentPage,
    pageSize,
    setTotal,
    handlePageChange,
    resetPagination,
    pagination: tablePagination,
  } = usePagination(1, 10);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState(
    filters.supplierId || null
  );
  const [dateRange, setDateRange] = useState(
    filters.startDate && filters.endDate
      ? [dayjs(filters.startDate), dayjs(filters.endDate)]
      : null
  );
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const sups = await suppliersService.getAllSuppliers();
        setSuppliers(Array.isArray(sups) ? sups : []);
      } catch (error) {
        console.error("Error loading suppliers:", error);
      }
    };
    loadSuppliers();
  }, []);

  const fetchImportOrdersList = useCallback(() => {
    const params = {
      pageNo: currentPage,
      pageSize,
      sortBy: "idImportOrder",
      sortDirection: "DESC",
    };

    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      if (startDate && endDate) {
        // Format date without timezone for backend LocalDateTime.parse()
        params.startDate = startDate
          .startOf("day")
          .format("YYYY-MM-DDTHH:mm:ss");
        params.endDate = endDate.endOf("day").format("YYYY-MM-DDTHH:mm:ss");
      }
    }

    if (supplierFilter) {
      params.supplierId = supplierFilter;
    }

    dispatch(fetchImportOrders(params));
  }, [dispatch, currentPage, pageSize, supplierFilter, dateRange]);

  useEffect(() => {
    fetchImportOrdersList();
  }, [fetchImportOrdersList]);

  useEffect(() => {
    setTotal(pagination.total || 0);
  }, [pagination.total, setTotal]);

  const handleTableChange = (p, _filters, sorter) => {
    handlePageChange(p.current, p.pageSize);
  };

  const handleSupplierFilter = (value) => {
    setSupplierFilter(value);
    dispatch(setFilters({ supplierId: value }));
    resetPagination(); // Reset về page 1
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates.length === 2) {
      dispatch(
        setFilters({
          startDate: dates[0].startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
          endDate: dates[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        })
      );
    } else {
      dispatch(setFilters({ startDate: null, endDate: null }));
    }
    resetPagination(); // Reset về page 1 khi thay đổi date range
  };

  const handleResetFilters = () => {
    setSupplierFilter(null);
    setDateRange(null);
    dispatch(setFilters({ supplierId: null, startDate: null, endDate: null }));
    resetPagination();
  };

  const handleCreateImportOrder = () => {
    setIsModalVisible(true);
  };

  const handleViewImportOrder = (importOrderId) => {
    navigate(`/import-orders/${importOrderId}`);
  };

  const handlePrintImportOrder = async (importOrderId, e) => {
    e?.stopPropagation();
    try {
      const blob = await importOrderService.exportImportOrderToPdf(
        importOrderId
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `phieu-nhap-hang-${importOrderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Xuất phiếu nhập hàng thành công!");
    } catch (error) {
      message.error("Xuất phiếu nhập hàng thất bại!");
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    fetchImportOrdersList();
  };

  const columns = [
    {
      title: "Mã đơn nhập",
      dataIndex: "idImportOrder",
      key: "idImportOrder",
      width: 120,
      render: (text) => <Text strong>#{text}</Text>,
    },
    {
      title: "Nhà cung cấp",
      key: "supplier",
      render: (record) => record.supplierName || "N/A",
    },
    {
      title: "Nhân viên",
      key: "employee",
      render: (record) => record.employeeName || "N/A",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => (
        <Text strong>
          {amount ? `${Number(amount).toLocaleString("vi-VN")} VNĐ` : "0 VNĐ"}
        </Text>
      ),
    },
    {
      title: "Ngày nhập",
      key: "orderDate",
      width: 160,
      render: (_, record) =>
        formatDate(
          record?.orderDate ?? record?.createdAt ?? record?.created_at,
          "DD/MM/YYYY HH:mm:ss"
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => {
        const importOrderId = record.idImportOrder || record.id;
        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewImportOrder(importOrderId)}
              />
            </Tooltip>
            <Tooltip title="In phiếu nhập">
              <Button
                type="text"
                icon={<PrinterOutlined />}
                onClick={(e) => handlePrintImportOrder(importOrderId, e)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handleExportExcel = () => {
    if (!importOrders || importOrders.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }
    try {
      exportToExcel(
        importOrders,
        `don-nhap-hang-${new Date().toISOString().split("T")[0]}`,
        columns
      );
      message.success("Xuất file Excel thành công!");
    } catch (error) {
      message.error(error?.message || "Xuất file Excel thất bại!");
    }
  };

  const handleExportCSV = () => {
    if (!importOrders || importOrders.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }
    try {
      exportToCSV(
        importOrders,
        `don-nhap-hang-${new Date().toISOString().split("T")[0]}`,
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
            Quản lý đơn nhập hàng
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Theo dõi các đơn nhập từ nhà cung cấp cho kho TechStore
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateImportOrder}
          style={{
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
          }}>
          Tạo đơn nhập hàng
        </Button>
      </div>

      <Card
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
            gap: 16,
            flexWrap: "wrap",
          }}>
          <Space
            wrap
            style={{
              display: "flex",
              gap: 8,
            }}>
            <Select
              placeholder="Lọc theo nhà cung cấp"
              style={{ width: 220 }}
              allowClear
              value={supplierFilter}
              onChange={handleSupplierFilter}>
              {suppliers.map((supplier) => (
                <Option key={supplier.idSupplier} value={supplier.idSupplier}>
                  {supplier.supplierName}
                </Option>
              ))}
            </Select>
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />
            {(supplierFilter || dateRange) && (
              <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
            )}
          </Space>
          <Space
            wrap
            style={{
              display: "flex",
              gap: 8,
            }}>
            <Button icon={<ReloadOutlined />} onClick={fetchImportOrdersList}>
              Làm mới
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
              Xuất CSV
            </Button>
          </Space>
        </div>

        {loading && importOrders.length === 0 ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : (
          <Table
            columns={columns}
            dataSource={importOrders}
            loading={loading}
            rowKey={(record) => record.idImportOrder || record.id}
            pagination={{
              ...tablePagination,
              current: currentPage,
              pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} đơn nhập hàng`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <EmptyState
                  description="Chưa có đơn nhập hàng nào"
                  actionText="Tạo đơn nhập hàng"
                  showAction
                  onAction={handleCreateImportOrder}
                />
              ),
            }}
            size="middle"
          />
        )}
      </Card>

      <Modal
        title="Tạo đơn nhập hàng mới"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}>
        <ImportOrderForm onSuccess={handleModalSuccess} />
      </Modal>
    </div>
  );
};

export default ImportOrders;
