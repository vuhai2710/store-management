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
    private String shippingAddressSnapshot; // Snapshot của địa chỉ tại thời điểm đặt hàng

    private LocalDateTime deliveredAt; // Thời điểm customer xác nhận đã nhận hàng

    private LocalDateTime completedAt; // Thời điểm đơn hàng hoàn thành (dùng để tính hạn đổi trả)

    private Integer returnWindowDays; // Snapshot số ngày cho phép đổi/trả tại thời điểm hoàn thành đơn

    private BigDecimal shippingFee; // Phí giao hàng từ Shipment

    private String paymentLinkId;

    private String paymentLinkUrl;

    private List<OrderDetailDTO> orderDetails;

    private Integer shippingAddressId;
    private String promotionCode;


    private Integer idPromotion;
    private Integer idPromotionRule;

    private Integer customerId;

    private String customerNameForCreate;
    private String customerPhoneForCreate;
    private String customerAddressForCreate;

    @Valid
    private List<OrderDetailDTO> orderItems;

    // ========== Fields từ BuyNowRequestDto (buy-now) ==========
    private Integer productId; // ID sản phẩm khi mua trực tiếp

    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity; // Số lượng khi mua trực tiếp
}
