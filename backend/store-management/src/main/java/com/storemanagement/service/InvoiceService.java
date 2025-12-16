package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.invoice.ExportInvoiceDTO;
import com.storemanagement.dto.invoice.ImportInvoiceDTO;
import com.storemanagement.model.Order;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

/**
 * Service interface for invoice management operations
 */
public interface InvoiceService {

    /**
     * Get paginated list of export invoices (from orders)
     */
    PageResponse<ExportInvoiceDTO> getExportInvoices(
            Pageable pageable,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Order.OrderStatus status);

    /**
     * Get paginated list of import invoices (from purchase orders)
     */
    PageResponse<ImportInvoiceDTO> getImportInvoices(
            Pageable pageable,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Integer supplierId);

    /**
     * Get export invoice by order ID
     */
    ExportInvoiceDTO getExportInvoiceById(Integer orderId);

    /**
     * Get import invoice by purchase order ID
     */
    ImportInvoiceDTO getImportInvoiceById(Integer purchaseOrderId);

    /**
     * Print export invoice (marks as printed, returns printable data)
     * 
     * @throws com.storemanagement.exception.InvoiceAlreadyPrintedException if
     *                                                                      already
     *                                                                      printed
     */
    ExportInvoiceDTO printExportInvoice(Integer orderId, Integer userId);

    /**
     * Print import invoice (marks as printed, returns printable data)
     * 
     * @throws com.storemanagement.exception.InvoiceAlreadyPrintedException if
     *                                                                      already
     *                                                                      printed
     */
    ImportInvoiceDTO printImportInvoice(Integer purchaseOrderId, Integer userId);
}
