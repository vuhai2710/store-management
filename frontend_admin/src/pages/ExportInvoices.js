import React, { useState, useEffect, useCallback } from "react";
import {
    Table,
    Card,
    Typography,
    Space,
    Button,
    Tag,
    Select,
    DatePicker,
    Tooltip,
    message,
    Drawer,
    Descriptions,
    Divider,
    List,
} from "antd";
import {
    PrinterOutlined,
    EyeOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import { invoiceService } from "../services/invoiceService";
import { formatDate } from "../utils/formatUtils";
import StatusBadge from "../components/common/StatusBadge";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Order status mapping
const ORDER_STATUS = {
    PENDING: { text: "Chờ xác nhận", color: "warning" },
    CONFIRMED: { text: "Đã xác nhận", color: "processing" },
    COMPLETED: { text: "Hoàn thành", color: "success" },
    CANCELED: { text: "Đã hủy", color: "error" },
};

const ExportInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [dateRange, setDateRange] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [printedFilter, setPrintedFilter] = useState(null); // null, true, false
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [printingId, setPrintingId] = useState(null);

    // Fetch invoices
    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                pageNo: pagination.current,
                pageSize: pagination.pageSize,
            };

            if (dateRange && dateRange[0] && dateRange[1]) {
                params.fromDate = dateRange[0].startOf("day").toISOString();
                params.toDate = dateRange[1].endOf("day").toISOString();
            }
            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await invoiceService.getExportInvoices(params);
            let filteredInvoices = response.content || [];

            // Filter by printed status on frontend
            if (printedFilter !== null) {
                filteredInvoices = filteredInvoices.filter(inv => inv.invoicePrinted === printedFilter);
            }

            setInvoices(filteredInvoices);
            setPagination((prev) => ({
                ...prev,
                total: printedFilter !== null ? filteredInvoices.length : (response.totalElements || 0),
            }));
        } catch (error) {
            message.error("Không thể tải danh sách hóa đơn xuất");
            console.error("Error fetching export invoices:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, dateRange, statusFilter, printedFilter]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    // Handle table pagination change
    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    // Handle view invoice detail
    const handleViewDetail = async (invoice) => {
        try {
            const detail = await invoiceService.getExportInvoiceById(invoice.orderId);
            setSelectedInvoice(detail);
            setDrawerVisible(true);
        } catch (error) {
            message.error("Không thể tải chi tiết hóa đơn");
        }
    };

    // Handle print invoice
    const handlePrint = async (invoice) => {
        // Only allow printing for COMPLETED orders
        if (invoice.status !== "COMPLETED") {
            message.warning("Chỉ có thể in hóa đơn cho đơn hàng đã hoàn thành");
            return;
        }

        if (invoice.invoicePrinted) {
            message.warning("Hóa đơn đã được in trước đó");
            return;
        }

        setPrintingId(invoice.orderId);
        try {
            const printData = await invoiceService.printExportInvoice(invoice.orderId);
            message.success("In hóa đơn thành công!");

            // Update invoice state immediately in table list
            setInvoices((prev) =>
                prev.map((inv) =>
                    inv.orderId === invoice.orderId
                        ? {
                            ...inv,
                            invoicePrinted: true,
                            invoicePrintedAt: printData.invoicePrintedAt,
                        }
                        : inv
                )
            );

            // Also update selectedInvoice if it's the same one (for drawer)
            if (selectedInvoice && selectedInvoice.orderId === invoice.orderId) {
                setSelectedInvoice({
                    ...selectedInvoice,
                    invoicePrinted: true,
                    invoicePrintedAt: printData.invoicePrintedAt,
                });
            }

            // Close the drawer after successful print
            setDrawerVisible(false);

            // Open print window
            openPrintWindow(printData);
        } catch (error) {
            if (error.status === 409) {
                message.error("Hóa đơn đã được in trước đó");
                // Refresh list to sync state
                fetchInvoices();
                // Close drawer
                setDrawerVisible(false);
            } else {
                message.error(error.message || "Không thể in hóa đơn");
            }
        } finally {
            setPrintingId(null);
        }
    };

    // Open print window with invoice data
    const openPrintWindow = (invoice) => {
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) {
            message.error("Không thể mở cửa sổ in. Vui lòng cho phép popup.");
            return;
        }

        const formatCurrency = (amount) =>
            (amount || 0).toLocaleString("vi-VN") + " VNĐ";

        const itemsHtml = (invoice.items || [])
            .map(
                (item, idx) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
        <td style="padding:8px;border:1px solid #ddd">${item.productName || ""}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.unitPrice)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.subtotal)}</td>
      </tr>
    `
            )
            .join("");

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn xuất #${invoice.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; }
          .summary { text-align: right; }
          .summary-row { margin: 8px 0; }
          .total { font-weight: bold; font-size: 18px; color: #1890ff; }
          .printed-notice { text-align: center; margin-top: 20px; padding: 15px; background: #f0f9ff; border: 1px solid #1890ff; border-radius: 8px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN XUẤT HÀNG</h1>
          <p>Mã đơn hàng: #${invoice.orderId}</p>
          <p>Ngày: ${formatDate(invoice.orderDate, "DD/MM/YYYY HH:mm")}</p>
        </div>
        
        <div class="info">
          <p><strong>Khách hàng:</strong> ${invoice.customerName || "N/A"}</p>
          <p><strong>Điện thoại:</strong> ${invoice.customerPhone || "N/A"}</p>
          <p><strong>Địa chỉ:</strong> ${invoice.customerAddress || "N/A"}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width:50px">STT</th>
              <th>Tên sản phẩm</th>
              <th style="width:80px">Số lượng</th>
              <th style="width:120px">Đơn giá</th>
              <th style="width:120px">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-row"><strong>Thành tiền sản phẩm:</strong> ${formatCurrency(invoice.productSubtotal)}</div>
          <div class="summary-row"><strong>Phí vận chuyển:</strong> ${formatCurrency(invoice.shippingFee)}</div>
          ${invoice.discount > 0 ? `<div class="summary-row"><strong>Giảm giá:</strong> -${formatCurrency(invoice.discount)}</div>` : ""}
          ${invoice.shippingDiscount > 0 ? `<div class="summary-row"><strong>Giảm phí vận chuyển:</strong> -${formatCurrency(invoice.shippingDiscount)}</div>` : ""}
          <div class="summary-row total"><strong>TỔNG THANH TOÁN:</strong> ${formatCurrency(invoice.finalPayable)}</div>
        </div>
        
        <div class="no-print printed-notice">
          <p><strong>✅ Hóa đơn đã được đánh dấu là đã in trong hệ thống.</strong></p>
          <p>Bạn có thể đóng cửa sổ này sau khi in xong.</p>
          <button onclick="window.print()" style="padding:10px 30px;font-size:16px;cursor:pointer;margin-top:10px">In hóa đơn</button>
          <button onclick="window.close()" style="padding:10px 30px;font-size:16px;cursor:pointer;margin-top:10px;margin-left:10px;background:#f5f5f5">Đóng</button>
        </div>
        
        <script>
          // Auto-close window after printing
          window.onafterprint = function() {
            window.close();
          };
          // Auto-trigger print dialog after page loads
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `);
        printWindow.document.close();
    };

    // Reset filters
    const handleResetFilters = () => {
        setDateRange(null);
        setStatusFilter(null);
        setPrintedFilter(null);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    // Table columns
    const columns = [
        {
            title: "Mã đơn hàng",
            dataIndex: "orderId",
            key: "orderId",
            width: 120,
            render: (id) => <Text strong>#{id}</Text>,
        },
        {
            title: "Khách hàng",
            dataIndex: "customerName",
            key: "customerName",
            render: (name) => name || "N/A",
        },
        {
            title: "Tổng thanh toán",
            dataIndex: "finalPayable",
            key: "finalPayable",
            width: 150,
            render: (amount) => (
                <Text strong>{(amount || 0).toLocaleString("vi-VN")} VNĐ</Text>
            ),
        },
        {
            title: "Trạng thái đơn",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (status) => (
                <StatusBadge status={status} statusMap={ORDER_STATUS} />
            ),
        },
        {
            title: "Ngày đặt",
            dataIndex: "orderDate",
            key: "orderDate",
            width: 160,
            render: (date) => formatDate(date, "DD/MM/YYYY HH:mm"),
        },
        {
            title: "Đã in",
            dataIndex: "invoicePrinted",
            key: "invoicePrinted",
            width: 100,
            align: "center",
            render: (printed, record) =>
                printed ? (
                    <Tooltip title={`In lúc: ${formatDate(record.invoicePrintedAt, "DD/MM/YYYY HH:mm")}`}>
                        <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
                    </Tooltip>
                ) : (
                    <CloseCircleOutlined style={{ color: "#d9d9d9", fontSize: 18 }} />
                ),
        },
        {
            title: "Hành động",
            key: "actions",
            width: 140,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    <Tooltip
                        title={
                            record.status !== "COMPLETED"
                                ? "Chỉ có thể in đơn đã hoàn thành"
                                : record.invoicePrinted
                                    ? "Hóa đơn chỉ được in 1 lần"
                                    : "In hóa đơn"
                        }
                    >
                        <Button
                            type="text"
                            icon={<PrinterOutlined />}
                            onClick={() => handlePrint(record)}
                            disabled={record.invoicePrinted || record.status !== "COMPLETED"}
                            loading={printingId === record.orderId}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "8px 0" }}>
            <div
                style={{
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <div>
                    <Title level={2} style={{ marginBottom: 4, fontWeight: 700 }}>
                        Hóa đơn xuất hàng
                    </Title>
                    <Text type="secondary">
                        Quản lý và in hóa đơn từ đơn hàng bán
                    </Text>
                </div>
            </div>

            <Card
                style={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                }}
                bodyStyle={{ padding: 16 }}
            >
                {/* Filters */}
                <div
                    style={{
                        marginBottom: 16,
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        format="DD/MM/YYYY"
                        placeholder={["Từ ngày", "Đến ngày"]}
                        style={{ width: 280 }}
                    />
                    <Select
                        placeholder="Trạng thái"
                        value={statusFilter}
                        onChange={(val) => {
                            setStatusFilter(val);
                            setPagination((prev) => ({ ...prev, current: 1 }));
                        }}
                        style={{ width: 160 }}
                        allowClear
                    >
                        {Object.keys(ORDER_STATUS).map((key) => (
                            <Option key={key} value={key}>
                                {ORDER_STATUS[key].text}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Trạng thái in"
                        value={printedFilter}
                        onChange={(val) => {
                            setPrintedFilter(val);
                            setPagination((prev) => ({ ...prev, current: 1 }));
                        }}
                        style={{ width: 140 }}
                        allowClear
                    >
                        <Option value={true}>Đã in</Option>
                        <Option value={false}>Chưa in</Option>
                    </Select>
                    <Button onClick={handleResetFilters} icon={<ReloadOutlined />}>
                        Đặt lại
                    </Button>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="orderId"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ["5", "10", "20", "50"],
                        showTotal: (total) => `Tổng ${total} hóa đơn`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                    size="middle"
                />
            </Card>

            {/* Detail Drawer */}
            <Drawer
                title={`Chi tiết hóa đơn #${selectedInvoice?.orderId || ""}`}
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                width={600}
            >
                {selectedInvoice && (
                    <>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Mã đơn hàng">
                                #{selectedInvoice.orderId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {selectedInvoice.customerName || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Điện thoại">
                                {selectedInvoice.customerPhone || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                {selectedInvoice.customerAddress || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                {formatDate(selectedInvoice.orderDate, "DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <StatusBadge
                                    status={selectedInvoice.status}
                                    statusMap={ORDER_STATUS}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Đã in">
                                {selectedInvoice.invoicePrinted ? (
                                    <Tag color="success">Đã in</Tag>
                                ) : (
                                    <Tag>Chưa in</Tag>
                                )}
                            </Descriptions.Item>
                            {selectedInvoice.invoicePrintedAt && (
                                <Descriptions.Item label="Thời gian in">
                                    {formatDate(selectedInvoice.invoicePrintedAt, "DD/MM/YYYY HH:mm")}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider>Danh sách sản phẩm</Divider>

                        <List
                            size="small"
                            dataSource={selectedInvoice.items || []}
                            renderItem={(item, idx) => (
                                <List.Item>
                                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                                        <span>
                                            {idx + 1}. {item.productName} x{item.quantity}
                                        </span>
                                        <span>{(item.subtotal || 0).toLocaleString("vi-VN")} VNĐ</span>
                                    </div>
                                </List.Item>
                            )}
                        />

                        <Divider />

                        <div style={{ textAlign: "right" }}>
                            <p>
                                <strong>Thành tiền sản phẩm:</strong>{" "}
                                {(selectedInvoice.productSubtotal || 0).toLocaleString("vi-VN")} VNĐ
                            </p>
                            <p>
                                <strong>Phí vận chuyển:</strong>{" "}
                                {(selectedInvoice.shippingFee || 0).toLocaleString("vi-VN")} VNĐ
                            </p>
                            {selectedInvoice.discount > 0 && (
                                <p>
                                    <strong>Giảm giá:</strong> -{(selectedInvoice.discount || 0).toLocaleString("vi-VN")} VNĐ
                                </p>
                            )}
                            {selectedInvoice.shippingDiscount > 0 && (
                                <p>
                                    <strong>Giảm phí vận chuyển:</strong> -{(selectedInvoice.shippingDiscount || 0).toLocaleString("vi-VN")} VNĐ
                                </p>
                            )}
                            <p style={{ fontSize: 18, color: "#1890ff" }}>
                                <strong>TỔNG THANH TOÁN:</strong>{" "}
                                {(selectedInvoice.finalPayable || 0).toLocaleString("vi-VN")} VNĐ
                            </p>
                        </div>

                        <Divider />

                        <Button
                            type="primary"
                            icon={<PrinterOutlined />}
                            block
                            disabled={selectedInvoice.invoicePrinted || selectedInvoice.status !== "COMPLETED"}
                            onClick={() => handlePrint(selectedInvoice)}
                        >
                            {selectedInvoice.status !== "COMPLETED"
                                ? "Chỉ in được đơn hàng đã hoàn thành"
                                : selectedInvoice.invoicePrinted
                                    ? "Hóa đơn đã được in"
                                    : "In hóa đơn"}
                        </Button>
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default ExportInvoices;
