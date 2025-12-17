package com.storemanagement.dto.invoice;

import com.storemanagement.model.Order;
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
public class ExportInvoiceDTO {

    private Integer orderId;
    private LocalDateTime orderDate;
    private Order.OrderStatus status;

    private Integer customerId;
    private String customerName;
    private String customerPhone;
    private String customerAddress;

    private Integer employeeId;
    private String employeeName;

    private List<InvoiceItemDTO> items;

    private BigDecimal productSubtotal;
    private BigDecimal shippingFee;
    private BigDecimal discount;
    private BigDecimal shippingDiscount;
    private BigDecimal finalPayable;

    private String promotionCode;
    private String shippingPromotionCode;

    private String paymentMethod;

    private Boolean invoicePrinted;
    private LocalDateTime invoicePrintedAt;
    private Integer invoicePrintedBy;
    private String printedByName;
}
