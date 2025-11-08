package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_shipment")
    private Integer idShipment;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order", unique = true, nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_status")
    @Builder.Default
    private ShippingStatus shippingStatus = ShippingStatus.PREPARING;

    @Column(name = "tracking_number", length = 50)
    private String trackingNumber;

    @Column(name = "location_lat", precision = 9, scale = 6)
    private BigDecimal locationLat;

    @Column(name = "location_long", precision = 9, scale = 6)
    private BigDecimal locationLong;

    // ========== GHN Integration Fields ==========

    /**
     * Mã đơn hàng từ GHN (order_code)
     * Được trả về khi tạo đơn thành công qua GHN API
     * Sử dụng để tracking và hủy đơn
     */
    @Column(name = "ghn_order_code", length = 50)
    private String ghnOrderCode;

    /**
     * Phí vận chuyển từ GHN
     * Được tính toán từ GHN Calculate Fee API
     */
    @Column(name = "ghn_shipping_fee", precision = 12, scale = 2)
    private BigDecimal ghnShippingFee;

    /**
     * Thời gian giao hàng dự kiến từ GHN
     */
    @Column(name = "ghn_expected_delivery_time")
    private LocalDateTime ghnExpectedDeliveryTime;

    /**
     * Trạng thái từ GHN API
     * Các giá trị: ready_to_pick, picking, cancel, money_collect_picking,
     * picked, storing, transporting, sorting, delivering, money_collect_delivering,
     * delivered, delivery_fail, wait_for_return, return, return_transporting,
     * return_sorting, returning, return_fail, returned, exception, damage, lost
     */
    @Column(name = "ghn_status", length = 50)
    private String ghnStatus;

    /**
     * Thời gian cập nhật trạng thái từ GHN (webhook)
     */
    @Column(name = "ghn_updated_at")
    private LocalDateTime ghnUpdatedAt;

    /**
     * Ghi chú/Lý do từ GHN (ví dụ: lý do giao thất bại)
     */
    @Column(name = "ghn_note", columnDefinition = "TEXT")
    private String ghnNote;

    /**
     * Phương thức vận chuyển
     * - GHN: Giao hàng qua GHN
     * - SELF_PICKUP: Khách tự đến lấy
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_method", length = 20)
    @Builder.Default
    private ShippingMethod shippingMethod = ShippingMethod.GHN;

    public enum ShippingStatus {
        PREPARING, SHIPPED, DELIVERED
    }

    public enum ShippingMethod {
        GHN,         // Giao hàng qua GHN
        SELF_PICKUP  // Khách tự đến lấy
    }
}











