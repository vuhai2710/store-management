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
import { suppliersService } from "../services/suppliersService";
import { formatDate } from "../utils/formatUtils";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ImportInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [dateRange, setDateRange] = useState(null);
    const [supplierFilter, setSupplierFilter] = useState(null);
    const [printedFilter, setPrintedFilter] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [printingId, setPrintingId] = useState(null);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await suppliersService.getSuppliers({ pageSize: 1000 });
                setSuppliers(response.content || []);
            } catch (error) {
                console.error("Error fetching suppliers:", error);
            }
        };
        fetchSuppliers();
    }, []);

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
            if (supplierFilter) {
                params.supplierId = supplierFilter;
            }

            const response = await invoiceService.getImportInvoices(params);
            let filteredInvoices = response.content || [];

            if (printedFilter !== null) {
                filteredInvoices = filteredInvoices.filter(inv => inv.invoicePrinted === printedFilter);
            }

            setInvoices(filteredInvoices);
            setPagination((prev) => ({
                ...prev,
                total: printedFilter !== null ? filteredInvoices.length : (response.totalElements || 0),
            }));
        } catch (error) {
            message.error("Không thể tải danh sách hóa đơn nhập");
            console.error("Error fetching import invoices:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, dateRange, supplierFilter, printedFilter]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const handleViewDetail = async (invoice) => {
        try {
            const detail = await invoiceService.getImportInvoiceById(invoice.purchaseOrderId);
            setSelectedInvoice(detail);
            setDrawerVisible(true);
        } catch (error) {
            message.error("Không thể tải chi tiết hóa đơn");
        }
    };

    const handlePrint = async (invoice) => {
        if (invoice.invoicePrinted) {
            message.warning("Hóa đơn đã được in trước đó");
            return;
        }

        setPrintingId(invoice.purchaseOrderId);
        try {
            const printData = await invoiceService.printImportInvoice(invoice.purchaseOrderId);
            message.success("In hóa đơn thành công!");

            setInvoices((prev) =>
                prev.map((inv) =>
                    inv.purchaseOrderId === invoice.purchaseOrderId
                        ? {
                            ...inv,
                            invoicePrinted: true,
                            invoicePrintedAt: printData.invoicePrintedAt,
                        }
                        : inv
                )
            );

            if (selectedInvoice && selectedInvoice.purchaseOrderId === invoice.purchaseOrderId) {
                setSelectedInvoice({
                    ...selectedInvoice,
                    invoicePrinted: true,
                    invoicePrintedAt: printData.invoicePrintedAt,
                });
            }

            setDrawerVisible(false);

            openPrintWindow(printData);
        } catch (error) {
            if (error.status === 409) {
                message.error("Hóa đơn đã được in trước đó");

                fetchInvoices();

                setDrawerVisible(false);
            } else {
                message.error(error.message || "Không thể in hóa đơn");
            }
        } finally {
            setPrintingId(null);
        }
    };

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
        <td style="padding:8px;border:1px solid #ddd">${item.productCode || ""}</td>
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
        <title>Hóa đơn nhập #${invoice.purchaseOrderId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; }
          .summary { text-align: right; }
          .total { font-weight: bold; font-size: 18px; color: #1890ff; }
          .printed-notice { text-align: center; margin-top: 20px; padding: 15px; background: #f0f9ff; border: 1px solid #1890ff; border-radius: 8px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PHIẾU NHẬP HÀNG</h1>
          <p>Mã phiếu nhập: #${invoice.purchaseOrderId}</p>
          <p>Ngày: ${formatDate(invoice.orderDate, "DD/MM/YYYY HH:mm")}</p>
        </div>

        <div class="info">
          <p><strong>Nhà cung cấp:</strong> ${invoice.supplierName || "N/A"}</p>
          <p><strong>Điện thoại:</strong> ${invoice.supplierPhone || "N/A"}</p>
          <p><strong>Email:</strong> ${invoice.supplierEmail || "N/A"}</p>
          <p><strong>Địa chỉ:</strong> ${invoice.supplierAddress || "N/A"}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:50px">STT</th>
              <th>Tên sản phẩm</th>
              <th style="width:100px">Mã SP</th>
              <th style="width:80px">Số lượng</th>
              <th style="width:120px">Đơn giá nhập</th>
              <th style="width:120px">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="total"><strong>TỔNG TIỀN NHẬP:</strong> ${formatCurrency(invoice.totalAmount)}</div>
        </div>

        <div class="no-print printed-notice">
          <p><strong>✅ Phiếu nhập đã được đánh dấu là đã in trong hệ thống.</strong></p>
          <p>Bạn có thể đóng cửa sổ này sau khi in xong.</p>
          <button onclick="window.print()" style="padding:10px 30px;font-size:16px;cursor:pointer;margin-top:10px">In phiếu nhập</button>
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

    const handleResetFilters = () => {
        setDateRange(null);
        setSupplierFilter(null);
        setPrintedFilter(null);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const columns = [
        {
            title: "Mã phiếu nhập",
            dataIndex: "purchaseOrderId",
            key: "purchaseOrderId",
            width: 130,
            render: (id) => <Text strong>#{id}</Text>,
        },
        {
            title: "Nhà cung cấp",
            dataIndex: "supplierName",
            key: "supplierName",
            render: (name) => name || "N/A",
        },
        {
            title: "Tổng tiền nhập",
            dataIndex: "totalAmount",
            key: "totalAmount",
            width: 150,
            render: (amount) => (
                <Text strong>{(amount || 0).toLocaleString("vi-VN")} VNĐ</Text>
            ),
        },
        {
            title: "Ngày nhập",
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
                            record.invoicePrinted
                                ? "Hóa đơn chỉ được in 1 lần"
                                : "In hóa đơn"
                        }
                    >
                        <Button
                            type="text"
                            icon={<PrinterOutlined />}
                            onClick={() => handlePrint(record)}
                            disabled={record.invoicePrinted}
                            loading={printingId === record.purchaseOrderId}
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
                        Hóa đơn nhập hàng
                    </Title>
                    <Text type="secondary">
                        Quản lý và in hóa đơn từ đơn nhập hàng
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
                { }
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
                        placeholder="Nhà cung cấp"
                        value={supplierFilter}
                        onChange={(val) => {
                            setSupplierFilter(val);
                            setPagination((prev) => ({ ...prev, current: 1 }));
                        }}
                        style={{ width: 200 }}
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                            option?.children?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {suppliers.map((supplier) => (
                            <Option key={supplier.idSupplier} value={supplier.idSupplier}>
                                {supplier.supplierName}
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

                { }
                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="purchaseOrderId"
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
                    scroll={{ x: 900 }}
                    size="middle"
                />
            </Card>

            { }
            <Drawer
                title={`Chi tiết phiếu nhập #${selectedInvoice?.purchaseOrderId || ""}`}
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                width={600}
            >
                {selectedInvoice && (
                    <>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Mã phiếu nhập">
                                #{selectedInvoice.purchaseOrderId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nhà cung cấp">
                                {selectedInvoice.supplierName || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Điện thoại">
                                {selectedInvoice.supplierPhone || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedInvoice.supplierEmail || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                {selectedInvoice.supplierAddress || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày nhập">
                                {formatDate(selectedInvoice.orderDate, "DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nhân viên">
                                {selectedInvoice.employeeName || "N/A"}
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
                                            {idx + 1}. {item.productName} ({item.productCode}) x{item.quantity}
                                        </span>
                                        <span>{(item.subtotal || 0).toLocaleString("vi-VN")} VNĐ</span>
                                    </div>
                                </List.Item>
                            )}
                        />

                        <Divider />

                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 18, color: "#1890ff" }}>
                                <strong>TỔNG TIỀN NHẬP:</strong>{" "}
                                {(selectedInvoice.totalAmount || 0).toLocaleString("vi-VN")} VNĐ
                            </p>
                        </div>

                        <Divider />

                        <Button
                            type="primary"
                            icon={<PrinterOutlined />}
                            block
                            disabled={selectedInvoice.invoicePrinted}
                            onClick={() => handlePrint(selectedInvoice)}
                        >
                            {selectedInvoice.invoicePrinted
                                ? "Phiếu đã được in"
                                : "In phiếu nhập"}
                        </Button>
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default ImportInvoices;
