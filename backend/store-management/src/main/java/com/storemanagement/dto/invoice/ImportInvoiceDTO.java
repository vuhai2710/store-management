package com.storemanagement.dto.invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportInvoiceDTO {

    private Integer purchaseOrderId;
    private LocalDateTime orderDate;

    private Integer supplierId;
    private String supplierName;
    private String supplierPhone;
    private String supplierEmail;
    private String supplierAddress;

    private Integer employeeId;
    private String employeeName;

    private List<InvoiceItemDTO> items;

    private BigDecimal totalAmount;

    private Boolean invoicePrinted;
    private LocalDateTime invoicePrintedAt;
    private Integer invoicePrintedBy;
    private String printedByName;
}
