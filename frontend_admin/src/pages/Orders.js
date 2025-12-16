import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Card,
  Typography,
  Modal,
  message,
  Tooltip,
  Badge,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchOrders,
  setPagination,
  setFilters,
} from "../store/slices/ordersSlice";
import OrderForm from "../components/orders/OrderForm";
import { usePagination, useDebounce } from "../hooks";
import StatusBadge from "../components/common/StatusBadge";
import { exportToExcel, exportToCSV } from "../utils/exportUtils";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import { formatDate } from "../utils/formatUtils";
import { useAdminReturnService } from "../hooks/useAdminReturnService";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { Title, Text } = Typography;
const { Option } = Select;

// Order status mapping
const ORDER_STATUS = {
  PENDING: { text: "Chờ xác nhận", color: "warning" },
  CONFIRMED: { text: "Đã xác nhận", color: "processing" },
  COMPLETED: { text: "Hoàn thành", color: "success" },
  CANCELED: { text: "Đã hủy", color: "error" },
};

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, pagination, filters } = useSelector(
    (state) => state.orders
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState(filters.status || null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Debounced search keyword for realtime search
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  // Order returns data for badge display
  const { getReturns } = useAdminReturnService();
  const [orderReturnsMap, setOrderReturnsMap] = useState({});

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    setTotal,
    handlePageChange,
    resetPagination,
    pagination: tablePagination,
  } = usePagination();

  // Fetch orders when pagination, filters or keyword change
  const fetchOrdersList = useCallback(() => {
    const params = {
      pageNo: currentPage,
      pageSize,
      sortBy: "orderDate",
      sortDirection: "DESC",
    };

    if (statusFilter) params.status = statusFilter;
    if (debouncedKeyword) params.keyword = debouncedKeyword;

    dispatch(fetchOrders(params));
  }, [dispatch, currentPage, pageSize, statusFilter, debouncedKeyword]);

  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

  // Reset page when keyword changes
  useEffect(() => {
    resetPagination();
  }, [debouncedKeyword, resetPagination]);

  // Fetch order returns to show badge on orders with active return requests
  useEffect(() => {
    const fetchOrderReturns = async () => {
      try {
        // Get active return requests (REQUESTED, APPROVED statuses)
        const response = await getReturns({ pageSize: 1000 });
        const returnsMap = {};
        (response.content || []).forEach((returnItem) => {
          if (!returnsMap[returnItem.orderId]) {
            returnsMap[returnItem.orderId] = [];
          }
          returnsMap[returnItem.orderId].push(returnItem);
        });
        setOrderReturnsMap(returnsMap);
      } catch (error) {
        console.error("Error fetching order returns:", error);
      }
    };
    fetchOrderReturns();
  }, [getReturns]);

  // Sync total from Redux to hook
  useEffect(() => {
    setTotal(pagination.total || 0);
  }, [pagination.total, setTotal]);

  const handleTableChange = (p, _filters, sorter) => {
    handlePageChange(p.current, p.pageSize);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    dispatch(setFilters({ status: value }));
    resetPagination(); // Reset về page 1
  };

  const handleResetFilters = () => {
    setStatusFilter(null);
    setSearchKeyword("");
    dispatch(setFilters({ status: null }));
    resetPagination();
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setIsModalVisible(true);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handlePrintInvoice = async (orderId, e) => {
    e?.stopPropagation();

    // Check order status and print status in current data
    const order = orders.find(o => (o.idOrder || o.id) === orderId);

    // Only allow printing for COMPLETED orders
    const status = order?.status?.toUpperCase?.() || order?.status;
    if (status !== "COMPLETED") {
      message.warning("Chỉ có thể in hóa đơn cho đơn hàng đã hoàn thành");
      return;
    }

    if (order?.invoicePrinted) {
      message.warning("Hóa đơn đã được in trước đó. Vui lòng vào trang Quản lý Hóa đơn để xem chi tiết.");
      return;
    }

    try {
      const { invoiceService } = await import("../services/invoiceService");
      const printData = await invoiceService.printExportInvoice(orderId);
      message.success("In hóa đơn thành công!");

      // Refresh order list to update printed status
      fetchOrdersList();

      // Open print window with invoice data
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        const formatCurrency = (amount) => (amount || 0).toLocaleString("vi-VN") + " VNĐ";
        const itemsHtml = (printData.items || []).map((item, idx) => `
          <tr>
            <td style="padding:8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
            <td style="padding:8px;border:1px solid #ddd">${item.productName || ""}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.unitPrice)}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.subtotal)}</td>
          </tr>
        `).join("");

        printWindow.document.write(`
          <!DOCTYPE html><html><head><title>Hóa đơn #${orderId}</title>
          <style>body{font-family:Arial,sans-serif;padding:20px}.header{text-align:center;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{background:#f5f5f5;padding:10px;border:1px solid #ddd}.summary{text-align:right}.total{font-weight:bold;font-size:18px;color:#1890ff}@media print{.no-print{display:none}}</style>
          </head><body>
          <div class="header"><h1>HÓA ĐƠN XUẤT HÀNG</h1><p>Mã đơn hàng: #${orderId}</p></div>
          <div><p><strong>Khách hàng:</strong> ${printData.customerName || "N/A"}</p><p><strong>Điện thoại:</strong> ${printData.customerPhone || "N/A"}</p></div>
          <table><thead><tr><th>STT</th><th>Tên sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>${itemsHtml}</tbody></table>
          <div class="summary"><p><strong>Thành tiền:</strong> ${formatCurrency(printData.productSubtotal)}</p><p><strong>Phí vận chuyển:</strong> ${formatCurrency(printData.shippingFee)}</p>${printData.discount > 0 ? `<p><strong>Giảm giá:</strong> -${formatCurrency(printData.discount)}</p>` : ""}<p class="total"><strong>TỔNG:</strong> ${formatCurrency(printData.finalPayable)}</p></div>
          <div class="no-print" style="margin-top:30px;text-align:center"><button onclick="window.print()" style="padding:10px 30px;font-size:16px;cursor:pointer">In hóa đơn</button></div>
          </body></html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      if (error.status === 409) {
        message.error("Hóa đơn đã được in trước đó");
        fetchOrdersList(); // Refresh to sync state
      } else {
        message.error("Xuất hóa đơn thất bại!");
      }
    }
  };

  const getStatusInfo = (status) => {
    if (!status) return { text: status, color: "default" };
    const statusUpper = status.toUpperCase();
    return ORDER_STATUS[statusUpper] || { text: status, color: "default" };
  };

  // Lấy ngày từ nhiều key (DTO dùng orderDate, phòng khi trả snake_case)
  const getOrderDateValue = (record) =>
    record?.orderDate ??
    record?.order_date ??
    record?.createdAt ??
    record?.created_at ??
    null;

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "idOrder",
      key: "idOrder",
      width: 130,
      render: (text, record) => {
        const orderId = record.idOrder || record.id;
        const orderReturns = orderReturnsMap[orderId];
        const hasActiveReturn =
          orderReturns &&
          orderReturns.some(
            (r) => r.status === "REQUESTED" || r.status === "APPROVED"
          );
        return (
          <Space>
            <Text strong>#{text}</Text>
            {hasActiveReturn && (
              <Tooltip title="Có yêu cầu đổi/trả">
                <Tag color="orange" style={{ marginLeft: 4 }}>
                  <SwapOutlined /> Đổi/Trả
                </Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (record) => record.customerName || "N/A",
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
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
      render: (method) => {
        if (!method) return <Tag>N/A</Tag>;
        const methodUpper = method.toUpperCase();
        if (methodUpper === "CASH") {
          return <Tag color="green">Tiền mặt</Tag>;
        } else if (methodUpper === "PAYOS") {
          return <Tag color="blue">PayOS</Tag>;
        } else if (methodUpper === "TRANSFER") {
          return <Tag color="purple">Chuyển khoản</Tag>;
        } else if (methodUpper === "ZALOPAY") {
          return <Tag color="orange">ZaloPay</Tag>;
        }
        return <Tag>{method}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => (
        <StatusBadge status={status} statusMap={ORDER_STATUS} />
      ),
    },
    {
      title: "Ngày đặt",
      key: "orderDate",
      width: 160,
      // dùng render để tự chọn field và format
      render: (_, record) =>
        formatDate(getOrderDateValue(record), "DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => {
        const orderId = record.idOrder || record.id;
        const status = record.status?.toUpperCase?.() || record.status;
        const isCompleted = status === "COMPLETED";
        const isPrinted = record.invoicePrinted;

        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewOrder(orderId)}
              />
            </Tooltip>
            <Tooltip
              title={
                !isCompleted
                  ? "Chỉ in được đơn đã hoàn thành"
                  : isPrinted
                    ? "Hóa đơn đã được in"
                    : "In hóa đơn"
              }
            >
              <Button
                type="text"
                icon={<PrinterOutlined />}
                onClick={(e) => handlePrintInvoice(orderId, e)}
                disabled={!isCompleted || isPrinted}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handleExportExcel = () => {
    if (!orders || orders.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }
    try {
      exportToExcel(
        orders,
        `don-hang-${new Date().toISOString().split("T")[0]}`,
        columns
      );
      message.success("Xuất file Excel thành công!");
    } catch (error) {
      message.error(error?.message || "Xuất file Excel thất bại!");
    }
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }
    try {
      exportToCSV(
        orders,
        `don-hang-${new Date().toISOString().split("T")[0]}`,
        columns
      );
      message.success("Xuất file CSV thành công!");
    } catch (error) {
      message.error(error?.message || "Xuất file CSV thất bại!");
    }
  };

  useEffect(() => {
    if (loading) {
      message.loading({ content: "Đang tải dữ liệu...", key: "fetchOrders" });
    } else {
      message.destroy("fetchOrders");
    }
  }, [loading]);

  return (
    <div className="page-orders" style={{ padding: "8px 0" }}>
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
            Quản lý đơn hàng
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Theo dõi và xử lý đơn hàng khách hàng TechStore
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateOrder}
          style={{
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
          }}>
          Tạo đơn hàng
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
          className="table-toolbar"
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}>
          <div
            className="filters"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{ width: 160 }}>
              <Option value="">Tất cả</Option>
              {Object.keys(ORDER_STATUS).map((key) => (
                <Option key={key} value={key}>
                  <StatusBadge status={key} statusMap={ORDER_STATUS} />
                </Option>
              ))}
            </Select>
            <Input
              placeholder="Tìm mã đơn, tên KH, SĐT..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 280, maxWidth: "100%" }}
              allowClear
            />
            <Button onClick={handleResetFilters} icon={<ReloadOutlined />}>
              Đặt lại bộ lọc
            </Button>
          </div>
          <div
            className="export-buttons"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}>
            <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              type="default">
              Xuất CSV
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={orders}
          pagination={tablePagination}
          loading={loading}
          onChange={handleTableChange}
          rowKey={(record) => record.idOrder || record.id}
          scroll={{ x: 1300 }}
          locale={{ emptyText: <EmptyState /> }}
          size="middle"
        />
      </Card>

      {/* Modal tạo đơn hàng - chỉ mở khi isModalVisible = true */}
      <Modal
        open={isModalVisible}
        title="Tạo đơn hàng"
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
        destroyOnClose>
        <OrderForm
          order={editingOrder}
          onSuccess={() => {
            setIsModalVisible(false);
            fetchOrdersList();
          }}
        />
      </Modal>
    </div>
  );
};

export default Orders;
