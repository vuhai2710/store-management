package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.invoice.ExportInvoiceDTO;
import com.storemanagement.dto.invoice.ImportInvoiceDTO;
import com.storemanagement.model.Order;
import com.storemanagement.service.InvoiceService;
import com.storemanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/export")
    public ResponseEntity<ApiResponse<PageResponse<ExportInvoiceDTO>>> getExportInvoices(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String status) {

        Sort.Direction direction = Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, "orderDate"));

        Order.OrderStatus orderStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {

            }
        }

        PageResponse<ExportInvoiceDTO> invoices = invoiceService.getExportInvoices(
                pageable, fromDate, toDate, orderStatus);

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách hóa đơn xuất thành công", invoices));
    }

    @GetMapping("/export/{orderId}")
    public ResponseEntity<ApiResponse<ExportInvoiceDTO>> getExportInvoiceById(
            @PathVariable Integer orderId) {
        ExportInvoiceDTO invoice = invoiceService.getExportInvoiceById(orderId);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết hóa đơn xuất thành công", invoice));
    }

    @PostMapping("/export/{orderId}/print")
    public ResponseEntity<ApiResponse<ExportInvoiceDTO>> printExportInvoice(
            @PathVariable Integer orderId) {

        Integer userId = SecurityUtils.getCurrentEmployeeId().orElse(null);

        ExportInvoiceDTO invoice = invoiceService.printExportInvoice(orderId, userId);
        return ResponseEntity.ok(ApiResponse.success("In hóa đơn thành công", invoice));
    }

    @GetMapping("/import")
    public ResponseEntity<ApiResponse<PageResponse<ImportInvoiceDTO>>> getImportInvoices(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) Integer supplierId) {

        Sort.Direction direction = Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, "orderDate"));

        PageResponse<ImportInvoiceDTO> invoices = invoiceService.getImportInvoices(
                pageable, fromDate, toDate, supplierId);

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách hóa đơn nhập thành công", invoices));
    }

    @GetMapping("/import/{purchaseOrderId}")
    public ResponseEntity<ApiResponse<ImportInvoiceDTO>> getImportInvoiceById(
            @PathVariable Integer purchaseOrderId) {
        ImportInvoiceDTO invoice = invoiceService.getImportInvoiceById(purchaseOrderId);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết hóa đơn nhập thành công", invoice));
    }

    @PostMapping("/import/{purchaseOrderId}/print")
    public ResponseEntity<ApiResponse<ImportInvoiceDTO>> printImportInvoice(
            @PathVariable Integer purchaseOrderId) {

        Integer userId = SecurityUtils.getCurrentEmployeeId().orElse(null);

        ImportInvoiceDTO invoice = invoiceService.printImportInvoice(purchaseOrderId, userId);
        return ResponseEntity.ok(ApiResponse.success("In hóa đơn thành công", invoice));
    }
}
