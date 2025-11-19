package com.storemanagement.dto.order;

import com.storemanagement.model.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * OrderDTO không kế thừa BaseDTO vì Order entity không extend BaseEntity (mặc dù database có created_at/updated_at)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Integer idOrder;

    // Customer fields (response)
    private Integer idCustomer;
    private String customerName;
    private String customerAddress;
    private String customerPhone;

    // Employee fields (response)
    private Integer idEmployee;
    private String employeeName;

    // Order basic fields
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

    /**
     * PayOS payment link ID
     * Được set khi tạo payment link thành công từ PayOS API
     */
    private String paymentLinkId;

    /**
     * PayOS payment link URL
     * URL để user thanh toán trên PayOS
     * Chỉ có giá trị khi paymentMethod = PAYOS và đã tạo payment link
     */
    private String paymentLinkUrl;

    private List<OrderDetailDTO> orderDetails;

    // ========== Fields từ CreateOrderRequestDto (checkout) ==========
    private Integer shippingAddressId; // Optional - nếu không có thì dùng default address hoặc customer.address
    private String promotionCode; // Optional - mã giảm giá (nếu có)

    // Promotion fields (response)
    private Integer idPromotion;
    private Integer idPromotionRule;

    // ========== Fields từ CreateOrderForCustomerRequestDto (create-for-customer) ==========
    private Integer customerId; // Optional - nếu null thì tạo customer mới

    // Thông tin khách hàng (required nếu customerId null)
    private String customerNameForCreate; // Tên khách hàng khi tạo mới
    private String customerPhoneForCreate; // Số điện thoại khi tạo mới
    private String customerAddressForCreate; // Địa chỉ khi tạo mới

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    @Valid
    private List<OrderDetailDTO> orderItems; // Danh sách sản phẩm khi tạo đơn cho khách hàng

    // ========== Fields từ BuyNowRequestDto (buy-now) ==========
    private Integer productId; // ID sản phẩm khi mua trực tiếp

    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity; // Số lượng khi mua trực tiếp
}
