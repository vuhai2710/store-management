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
import { useDebounce } from "../hooks/useDebounce";
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
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebounce(searchKeyword, 300);
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

    // Add keyword search
    if (debouncedKeyword && debouncedKeyword.trim()) {
      params.keyword = debouncedKeyword.trim();
    }

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
  }, [
    dispatch,
    currentPage,
    pageSize,
    supplierFilter,
    dateRange,
    debouncedKeyword,
  ]);

  useEffect(() => {
    fetchImportOrdersList();
  }, [fetchImportOrdersList]);

  useEffect(() => {
    setTotal(pagination.total || 0);
  }, [pagination.total, setTotal]);

  // Reset pagination when keyword changes
  useEffect(() => {
    if (debouncedKeyword !== undefined) {
      resetPagination();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

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
    setSearchKeyword("");
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

    // Check if already printed in current data
    const order = importOrders.find(o => (o.idImportOrder || o.id) === importOrderId);
    if (order?.invoicePrinted) {
      message.warning("Phiếu nhập đã được in trước đó. Vui lòng vào trang Quản lý Hóa đơn để xem chi tiết.");
      return;
    }

    try {
      const { invoiceService } = await import("../services/invoiceService");
      const printData = await invoiceService.printImportInvoice(importOrderId);
      message.success("In phiếu nhập hàng thành công!");

      // Refresh list to update printed status
      fetchImportOrdersList();

      // Open print window with invoice data
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        const formatCurrency = (amount) => (amount || 0).toLocaleString("vi-VN") + " VNĐ";
        const itemsHtml = (printData.items || []).map((item, idx) => `
          <tr>
            <td style="padding:8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
            <td style="padding:8px;border:1px solid #ddd">${item.productName || ""}</td>
            <td style="padding:8px;border:1px solid #ddd">${item.productCode || ""}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.unitPrice)}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.subtotal)}</td>
          </tr>
        `).join("");

        printWindow.document.write(`
          <!DOCTYPE html><html><head><title>Phiếu nhập hàng #${importOrderId}</title>
          <style>body{font-family:Arial,sans-serif;padding:20px}.header{text-align:center;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{background:#f5f5f5;padding:10px;border:1px solid #ddd}.summary{text-align:right}.total{font-weight:bold;font-size:18px;color:#1890ff}@media print{.no-print{display:none}}</style>
          </head><body>
          <div class="header"><h1>PHIẾU NHẬP HÀNG</h1><p>Mã phiếu nhập: #${importOrderId}</p></div>
          <div><p><strong>Nhà cung cấp:</strong> ${printData.supplierName || "N/A"}</p><p><strong>Điện thoại:</strong> ${printData.supplierPhone || "N/A"}</p></div>
          <table><thead><tr><th>STT</th><th>Tên sản phẩm</th><th>Mã SP</th><th>Số lượng</th><th>Đơn giá nhập</th><th>Thành tiền</th></tr></thead><tbody>${itemsHtml}</tbody></table>
          <div class="summary"><p class="total"><strong>TỔNG TIỀN NHẬP:</strong> ${formatCurrency(printData.totalAmount)}</p></div>
          <div class="no-print" style="margin-top:30px;text-align:center"><button onclick="window.print()" style="padding:10px 30px;font-size:16px;cursor:pointer">In phiếu nhập</button></div>
          </body></html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      if (error.status === 409) {
        message.error("Phiếu nhập đã được in trước đó");
        fetchImportOrdersList(); // Refresh to sync state
      } else {
        message.error("Xuất phiếu nhập hàng thất bại!");
      }
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
            <Input
              placeholder="Tìm kiếm mã đơn, nhà cung cấp..."
              prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
              style={{ width: 250 }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
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
            {(supplierFilter || dateRange || searchKeyword) && (
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
