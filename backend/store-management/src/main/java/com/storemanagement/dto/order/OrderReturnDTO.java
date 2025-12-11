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

    private OrderReturn.ReturnType returnType;
    private OrderReturn.ReturnStatus status;

    private String reason;
    private String noteAdmin;

    private BigDecimal refundAmount;
    private BigDecimal orderFinalAmount; // Tổng tiền đơn hàng khách đã thanh toán
    private BigDecimal orderTotalAmount; // Tổng tiền sản phẩm (chưa trừ giảm giá)
    private BigDecimal orderDiscount;    // Số tiền giảm giá
    private BigDecimal orderShippingFee; // Phí ship

    private Integer createdByCustomerId;
    private Integer processedByEmployeeId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<OrderReturnItemDTO> items;
}
