package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_order")
    private Integer idOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_customer")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employee")
    private Employee employee;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount", precision = 15, scale = 2)
    private BigDecimal discount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "final_amount", precision = 15, scale = 2, insertable = false, updatable = false)
    private BigDecimal finalAmount; // Generated column

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_shipping_address")
    private ShippingAddress shippingAddress;

    @Column(name = "shipping_address_snapshot", columnDefinition = "TEXT")
    private String shippingAddressSnapshot; // Snapshot của địa chỉ tại thời điểm đặt hàng

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderDetail> orderDetails = new ArrayList<>();

    @OneToOne(mappedBy = "order", fetch = FetchType.LAZY)
    private Shipment shipment;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt; // Thời điểm customer xác nhận đã nhận hàng

    @Column(name = "completed_at")
    private LocalDateTime completedAt; // Thời điểm đơn hàng hoàn thành (dùng để tính hạn đổi trả)

    @Column(name = "return_window_days")
    private Integer returnWindowDays; // Snapshot của số ngày cho phép đổi/trả tại thời điểm hoàn thành đơn

    @Column(name = "shipping_fee", precision = 12, scale = 2)
    private BigDecimal shippingFee; // Phí giao hàng

    @Column(name = "payment_link_id", length = 255)
    private String paymentLinkId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_promotion")
    private Promotion promotion;

    @Column(name = "promotion_code", length = 50)
    private String promotionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_promotion_rule")
    private PromotionRule promotionRule;

    // Shipping-specific discount fields
    @Column(name = "shipping_discount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal shippingDiscount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_shipping_promotion")
    private Promotion shippingPromotion;

    @Column(name = "shipping_promotion_code", length = 50)
    private String shippingPromotionCode;

    // Invoice print tracking fields
    @Column(name = "invoice_printed")
    @Builder.Default
    private Boolean invoicePrinted = false;

    @Column(name = "invoice_printed_at")
    private LocalDateTime invoicePrintedAt;

    @Column(name = "invoice_printed_by")
    private Integer invoicePrintedBy;

    @PrePersist
    protected void onCreate() {
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
        }
    }

    public enum OrderStatus {
        PENDING, CONFIRMED, COMPLETED, CANCELED
    }

    public enum PaymentMethod {
        CASH, PAYOS
    }
}