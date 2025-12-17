package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.invoice.ExportInvoiceDTO;
import com.storemanagement.dto.invoice.ImportInvoiceDTO;
import com.storemanagement.model.Order;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface InvoiceService {

    PageResponse<ExportInvoiceDTO> getExportInvoices(
            Pageable pageable,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Order.OrderStatus status);

    PageResponse<ImportInvoiceDTO> getImportInvoices(
            Pageable pageable,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Integer supplierId);

    ExportInvoiceDTO getExportInvoiceById(Integer orderId);

    ImportInvoiceDTO getImportInvoiceById(Integer purchaseOrderId);

    ExportInvoiceDTO printExportInvoice(Integer orderId, Integer userId);

    ImportInvoiceDTO printImportInvoice(Integer purchaseOrderId, Integer userId);
}
