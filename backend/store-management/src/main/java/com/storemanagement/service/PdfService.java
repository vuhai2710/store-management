package com.storemanagement.service;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.storemanagement.dto.response.ImportOrderDetailDto;
import com.storemanagement.dto.response.ImportOrderDto;
import com.storemanagement.dto.response.OrderDetailDto;
import com.storemanagement.dto.response.OrderDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service tái sử dụng để tạo PDF từ HTML
 * Tập trung tất cả logic generate HTML và PDF tại đây
 */
@Service
@Slf4j
public class PdfService {

    /**
     * Tạo PDF từ HTML content
     *
     * @param htmlContent HTML content
     * @return Byte array của PDF file
     */
    public byte[] generatePdfFromHtml(String htmlContent) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ConverterProperties properties = new ConverterProperties();
            
            // Set UTF-8 encoding để hỗ trợ tiếng Việt
            properties.setCharset(StandardCharsets.UTF_8.name());
            
            HtmlConverter.convertToPdf(htmlContent, outputStream, properties);
            
            byte[] pdfBytes = outputStream.toByteArray();
            log.info("Generated PDF with size: {} bytes", pdfBytes.length);
            
            return pdfBytes;
        } catch (Exception e) {
            log.error("Error generating PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo file PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo PDF cho phiếu nhập hàng
     *
     * @param importOrderDto DTO của đơn nhập hàng
     * @return Byte array của PDF file
     */
    public byte[] generateImportOrderPdf(ImportOrderDto importOrderDto) {
        String htmlContent = generateImportOrderHtml(importOrderDto);
        String fullHtml = wrapHtmlTemplate("PHIẾU NHẬP HÀNG", htmlContent);
        return generatePdfFromHtml(fullHtml);
    }

    /**
     * Tạo PDF cho hóa đơn bán hàng
     *
     * @param orderDto DTO của đơn hàng
     * @return Byte array của PDF file
     */
    public byte[] generateInvoicePdf(OrderDto orderDto) {
        String htmlContent = generateInvoiceHtml(orderDto);
        String fullHtml = wrapHtmlTemplate("HÓA ĐƠN BÁN HÀNG", htmlContent);
        return generatePdfFromHtml(fullHtml);
    }

    /**
     * Generate HTML content cho phiếu nhập hàng
     */
    private String generateImportOrderHtml(ImportOrderDto dto) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        StringBuilder html = new StringBuilder();
        
        // Header
        html.append("""
            <div class="header">
                <h1>PHIẾU NHẬP HÀNG</h1>
                <p>Mã đơn: #PO-%d</p>
                <p>Ngày nhập: %s</p>
            </div>
            """.formatted(dto.getIdImportOrder(), 
                    dto.getOrderDate() != null ? dto.getOrderDate().format(dateFormatter) : ""));

        // Thông tin nhà cung cấp
        html.append("""
            <div class="info-section">
                <h2>Thông tin nhà cung cấp</h2>
                <div class="info-row">
                    <span class="info-label">Tên nhà cung cấp:</span>
                    <span class="info-value">%s</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Địa chỉ:</span>
                    <span class="info-value">%s</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Số điện thoại:</span>
                    <span class="info-value">%s</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">%s</span>
                </div>
            </div>
            """.formatted(
                dto.getSupplierName() != null ? dto.getSupplierName() : "",
                dto.getSupplierAddress() != null ? dto.getSupplierAddress() : "",
                dto.getSupplierPhone() != null ? dto.getSupplierPhone() : "",
                dto.getSupplierEmail() != null ? dto.getSupplierEmail() : ""
        ));

        // Thông tin nhân viên
        if (dto.getIdEmployee() != null) {
            html.append("""
                <div class="info-section">
                    <h2>Thông tin nhân viên</h2>
                    <div class="info-row">
                        <span class="info-label">Nhân viên tạo đơn:</span>
                        <span class="info-value">%s</span>
                    </div>
                </div>
                """.formatted(dto.getEmployeeName() != null ? dto.getEmployeeName() : ""));
        }

        // Bảng chi tiết sản phẩm
        html.append("""
            <div class="info-section">
                <h2>Chi tiết sản phẩm nhập</h2>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Mã sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
            """);

        int stt = 1;
        for (ImportOrderDetailDto detail : dto.getImportOrderDetails()) {
            BigDecimal subtotal = detail.getImportPrice()
                    .multiply(BigDecimal.valueOf(detail.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            html.append("""
                <tr>
                    <td>%d</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td class="text-right">%d</td>
                    <td class="text-right">%s</td>
                    <td class="text-right">%s</td>
                </tr>
                """.formatted(
                    stt++,
                    detail.getProductName() != null ? detail.getProductName() : "",
                    detail.getProductCode() != null ? detail.getProductCode() : "",
                    detail.getQuantity(),
                    formatCurrency(detail.getImportPrice()),
                    formatCurrency(subtotal)
            ));
        }

        html.append("""
                    </tbody>
                </table>
            </div>
            """);

        // Tổng tiền
        html.append("""
            <div class="total-section">
                <div class="total-row">
                    <span class="total-label">Tổng tiền:</span>
                    <span class="total-value"><strong>%s</strong></span>
                </div>
            </div>
            """.formatted(formatCurrency(dto.getTotalAmount())));

        // Footer
        html.append("""
            <div class="footer">
                <p>Phiếu này được tạo tự động bởi hệ thống quản lý kho</p>
                <p>Ngày xuất: %s</p>
            </div>
            """.formatted(LocalDateTime.now().format(dateFormatter)));

        return html.toString();
    }

    /**
     * Generate HTML content cho hóa đơn bán hàng
     */
    private String generateInvoiceHtml(OrderDto dto) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        StringBuilder html = new StringBuilder();

        // Header
        html.append("""
            <div class="header">
                <h1>HÓA ĐƠN BÁN HÀNG</h1>
                <p>Mã đơn: #HD-%d</p>
                <p>Ngày bán: %s</p>
            </div>
            """.formatted(dto.getIdOrder(),
                    dto.getOrderDate() != null ? dto.getOrderDate().format(dateFormatter) : ""));

        // Thông tin khách hàng
        if (dto.getIdCustomer() != null) {
            html.append("""
                <div class="info-section">
                    <h2>Thông tin khách hàng</h2>
                    <div class="info-row">
                        <span class="info-label">Tên khách hàng:</span>
                        <span class="info-value">%s</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Địa chỉ:</span>
                        <span class="info-value">%s</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Số điện thoại:</span>
                        <span class="info-value">%s</span>
                    </div>
                </div>
                """.formatted(
                    dto.getCustomerName() != null ? dto.getCustomerName() : "",
                    dto.getCustomerAddress() != null ? dto.getCustomerAddress() : "",
                    dto.getCustomerPhone() != null ? dto.getCustomerPhone() : ""
            ));
        }

        // Thông tin nhân viên
        if (dto.getIdEmployee() != null) {
            html.append("""
                <div class="info-section">
                    <h2>Thông tin nhân viên</h2>
                    <div class="info-row">
                        <span class="info-label">Nhân viên bán hàng:</span>
                        <span class="info-value">%s</span>
                    </div>
                </div>
                """.formatted(dto.getEmployeeName() != null ? dto.getEmployeeName() : ""));
        }

        // Bảng chi tiết sản phẩm
        html.append("""
            <div class="info-section">
                <h2>Chi tiết sản phẩm</h2>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Mã sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
            """);

        int stt = 1;
        for (OrderDetailDto detail : dto.getOrderDetails()) {
            BigDecimal subtotal = detail.getPrice()
                    .multiply(BigDecimal.valueOf(detail.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            html.append("""
                <tr>
                    <td>%d</td>
                    <td>%s</td>
                    <td>%s</td>
                    <td class="text-right">%d</td>
                    <td class="text-right">%s</td>
                    <td class="text-right">%s</td>
                </tr>
                """.formatted(
                    stt++,
                    detail.getProductName() != null ? detail.getProductName() : "",
                    detail.getProductCode() != null ? detail.getProductCode() : "",
                    detail.getQuantity(),
                    formatCurrency(detail.getPrice()),
                    formatCurrency(subtotal)
            ));
        }

        html.append("""
                    </tbody>
                </table>
            </div>
            """);

        // Tổng tiền, giảm giá, thành tiền
        html.append("""
            <div class="total-section">
                <div class="total-row">
                    <span class="total-label">Tổng tiền:</span>
                    <span class="total-value">%s</span>
                </div>
            """.formatted(formatCurrency(dto.getTotalAmount())));

        // Giảm giá (nếu có)
        if (dto.getDiscount() != null && dto.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            html.append("""
                <div class="total-row">
                    <span class="total-label">Giảm giá:</span>
                    <span class="total-value">-%s</span>
                </div>
                """.formatted(formatCurrency(dto.getDiscount())));
        }

        // Thành tiền cuối cùng
        html.append("""
                <div class="total-row">
                    <span class="total-label">Thành tiền:</span>
                    <span class="total-value"><strong>%s</strong></span>
                </div>
            """.formatted(formatCurrency(dto.getFinalAmount())));

        // Phương thức thanh toán
        if (dto.getPaymentMethod() != null) {
            String paymentMethodText = switch (dto.getPaymentMethod()) {
                case CASH -> "Tiền mặt";
                case TRANSFER -> "Chuyển khoản";
                case ZALOPAY -> "ZaloPay";
            };
            html.append("""
                <div class="total-row">
                    <span class="total-label">Phương thức thanh toán:</span>
                    <span class="total-value">%s</span>
                </div>
                """.formatted(paymentMethodText));
        }

        html.append("""
            </div>
            """);

        // Ghi chú (nếu có)
        if (dto.getNotes() != null && !dto.getNotes().trim().isEmpty()) {
            html.append("""
                <div class="info-section">
                    <h2>Ghi chú</h2>
                    <p>%s</p>
                </div>
                """.formatted(dto.getNotes()));
        }

        // Footer
        html.append("""
            <div class="footer">
                <p>Hóa đơn này được tạo tự động bởi hệ thống quản lý cửa hàng</p>
                <p>Ngày xuất: %s</p>
            </div>
            """.formatted(LocalDateTime.now().format(dateFormatter)));

        return html.toString();
    }

    /**
     * Wrap HTML content với template (CSS, structure)
     */
    private String wrapHtmlTemplate(String title, String content) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>%s</title>
                <style>
                    @page {
                        margin: 2cm;
                        size: A4;
                    }
                    body {
                        font-family: 'DejaVu Sans', Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .header p {
                        margin: 5px 0;
                    }
                    .info-section {
                        margin-bottom: 20px;
                    }
                    .info-section h2 {
                        font-size: 16px;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 5px;
                    }
                    .info-row {
                        display: flex;
                        margin-bottom: 8px;
                    }
                    .info-label {
                        font-weight: bold;
                        width: 150px;
                    }
                    .info-value {
                        flex: 1;
                    }
                    table {
                        width: 100%%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    table th,
                    table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .total-section {
                        margin-top: 20px;
                        text-align: right;
                    }
                    .total-row {
                        margin: 5px 0;
                        font-size: 14px;
                    }
                    .total-label {
                        font-weight: bold;
                        display: inline-block;
                        width: 150px;
                    }
                    .total-value {
                        display: inline-block;
                        width: 150px;
                        text-align: right;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                %s
            </body>
            </html>
            """.formatted(title, content);
    }

    /**
     * Format số tiền thành chuỗi tiền tệ Việt Nam
     */
    private String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "0 đ";
        }
        return String.format("%,.0f đ", amount.doubleValue());
    }
}























