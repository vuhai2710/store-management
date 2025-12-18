package com.storemanagement.dto.order;

import com.storemanagement.model.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class OrderDTO {
    private Integer idOrder;

    private Integer idCustomer;
    private String customerName;
    private String customerAddress;
    private String customerPhone;

    private Integer idEmployee;
    private String employeeName;

    private LocalDateTime orderDate;
    private Order.OrderStatus status;

    private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal finalAmount;

    private Order.PaymentMethod paymentMethod;
    private String notes;

    private Integer idShippingAddress;
    private String shippingAddressSnapshot;

    private LocalDateTime deliveredAt;

    private LocalDateTime completedAt;

    private Integer returnWindowDays;

    private BigDecimal shippingFee;

    private String paymentLinkId;

    private String paymentLinkUrl;

    private List<OrderDetailDTO> orderDetails;

    private Integer shippingAddressId;
    private String promotionCode;

    private Integer idPromotion;
    private Integer idPromotionRule;
    private String promotionName;
    private String promotionDiscountType;
    private java.math.BigDecimal promotionDiscountValue;
    private String promotionScope;

    private BigDecimal shippingDiscount;
    private String shippingPromotionCode;
    private Integer idShippingPromotion;

    private Integer customerId;

    private String customerNameForCreate;
    private String customerPhoneForCreate;
    private String customerAddressForCreate;

    @Valid
    private List<OrderDetailDTO> orderItems;

    private Integer productId;

    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
}
