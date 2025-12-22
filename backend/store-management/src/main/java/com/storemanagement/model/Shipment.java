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

    @Column(name = "ghn_order_code", length = 50)
    private String ghnOrderCode;

    @Column(name = "ghn_shipping_fee", precision = 12, scale = 2)
    private BigDecimal ghnShippingFee;

    @Column(name = "ghn_expected_delivery_time")
    private LocalDateTime ghnExpectedDeliveryTime;

    @Column(name = "ghn_status", length = 50)
    private String ghnStatus;

    @Column(name = "ghn_updated_at")
    private LocalDateTime ghnUpdatedAt;

    @Column(name = "ghn_note", columnDefinition = "TEXT")
    private String ghnNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_method", length = 20)
    @Builder.Default
    private ShippingMethod shippingMethod = ShippingMethod.GHN;

    public enum ShippingStatus {
        PREPARING, PICKING_UP, SHIPPED, DELIVERED
    }

    public enum ShippingMethod {
        GHN,
        SELF_PICKUP
    }
}
