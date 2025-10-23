package com.storemanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Shipment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_shipment")
    private Integer idShipment;
    
    @OneToOne
    @JoinColumn(name = "id_order", unique = true)
    private Order order;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_status")
    private ShippingStatus shippingStatus = ShippingStatus.PREPARING;
    
    @Column(name = "tracking_number", length = 50)
    private String trackingNumber;
    
    @Column(name = "location_lat", precision = 9, scale = 6)
    private BigDecimal locationLat;
    
    @Column(name = "location_long", precision = 9, scale = 6)
    private BigDecimal locationLong;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum ShippingStatus {
        PREPARING, SHIPPED, DELIVERED
    }
}
