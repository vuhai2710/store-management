package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "shipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Shipment extends BaseEntity {
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

    public enum ShippingStatus {
        PREPARING, SHIPPED, DELIVERED
    }
}


