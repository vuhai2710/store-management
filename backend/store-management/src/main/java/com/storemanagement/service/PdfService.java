package com.storemanagement.service;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Service tái sử dụng để tạo PDF từ HTML
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
     * Tạo HTML template cho phiếu nhập hàng
     */
    public String generateImportOrderHtmlTemplate(String title, String content) {
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
}






















