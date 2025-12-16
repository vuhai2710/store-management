package com.storemanagement.dto.invoice;

import com.storemanagement.model.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for export invoice (from sales orders)
 * Contains complete invoice data for printing
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportInvoiceDTO {
    // Order identification
    private Integer orderId;
    private LocalDateTime orderDate;
    private Order.OrderStatus status;

    // Customer info
    private Integer customerId;
    private String customerName;
    private String customerPhone;
    private String customerAddress;

    // Employee info
    private Integer employeeId;
    private String employeeName;

    // Order items
    private List<InvoiceItemDTO> items;

    // Price breakdown
    private BigDecimal productSubtotal; // Sum of items (excluding shipping)
    private BigDecimal shippingFee; // Shipping fee (separate line)
    private BigDecimal discount; // Discount amount
    private BigDecimal shippingDiscount; // Shipping discount
    private BigDecimal finalPayable; // Final amount to pay

    // Promotion info
    private String promotionCode;
    private String shippingPromotionCode;

    // Payment info
    private String paymentMethod;

    // Print status
    private Boolean invoicePrinted;
    private LocalDateTime invoicePrintedAt;
    private Integer invoicePrintedBy;
    private String printedByName;
}
