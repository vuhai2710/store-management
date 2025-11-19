package com.storemanagement.dto.shipment;

import com.storemanagement.model.Shipment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentDTO {
    private Integer idShipment;
    private Integer idOrder;
    private Shipment.ShippingStatus shippingStatus;
    private String trackingNumber;
    private BigDecimal locationLat;
    private BigDecimal locationLong;
    private String ghnOrderCode;
    private BigDecimal ghnShippingFee;
    private LocalDateTime ghnExpectedDeliveryTime;
    private String ghnStatus;
    private LocalDateTime ghnUpdatedAt;
    private String ghnNote;
    private Shipment.ShippingMethod shippingMethod;
}
