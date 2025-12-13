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
    
    // Customer info for admin display
    private Integer customerId;
    private String customerName;

    private OrderReturn.ReturnType returnType;
    private OrderReturn.ReturnStatus status;

    private String reason;
    private String noteAdmin;

    private BigDecimal refundAmount;
    private BigDecimal orderFinalAmount; // Tổng tiền đơn hàng khách đã thanh toán
    private BigDecimal orderTotalAmount; // Tổng tiền sản phẩm (chưa trừ giảm giá)
    private BigDecimal orderDiscount;    // Số tiền giảm giá
    private BigDecimal orderShippingFee; // Phí ship

    // Promotion info for price breakdown
    private String orderPromotionCode;      // Mã giảm giá đã dùng
    private String orderPromotionName;      // Tên chương trình giảm giá
    private String orderPromotionDiscountType; // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal orderPromotionDiscountValue; // Giá trị giảm (% hoặc số tiền)
    private String orderPromotionScope;     // ORDER or SHIPPING

    private Integer createdByCustomerId;
    private Integer processedByEmployeeId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<OrderReturnItemDTO> items;
}
