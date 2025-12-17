package com.storemanagement.dto.order;

import com.storemanagement.model.OrderReturn;
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
public class OrderReturnDTO {
    private Integer idReturn;
    private Integer orderId;

    private Integer customerId;
    private String customerName;

    private OrderReturn.ReturnType returnType;
    private OrderReturn.ReturnStatus status;

    private String reason;
    private String noteAdmin;

    private BigDecimal refundAmount;
    private BigDecimal orderFinalAmount;
    private BigDecimal orderTotalAmount;
    private BigDecimal orderDiscount;
    private BigDecimal orderShippingFee;

    private String orderPromotionCode;
    private String orderPromotionName;
    private String orderPromotionDiscountType;
    private BigDecimal orderPromotionDiscountValue;
    private String orderPromotionScope;

    private Integer createdByCustomerId;
    private Integer processedByEmployeeId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<OrderReturnItemDTO> items;
}
