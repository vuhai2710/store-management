package com.storemanagement.dto.invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for import invoice (from purchase orders)
 * Contains complete invoice data for printing
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportInvoiceDTO {
    // Purchase order identification
    private Integer purchaseOrderId;
    private LocalDateTime orderDate;

    // Supplier info
    private Integer supplierId;
    private String supplierName;
    private String supplierPhone;
    private String supplierEmail;
    private String supplierAddress;

    // Employee info
    private Integer employeeId;
    private String employeeName;

    // Order items
    private List<InvoiceItemDTO> items;

    // Price summary
    private BigDecimal totalAmount;

    // Print status
    private Boolean invoicePrinted;
    private LocalDateTime invoicePrintedAt;
    private Integer invoicePrintedBy;
    private String printedByName;
}
