package com.storemanagement.service;

import com.storemanagement.dto.ghn.GHNTrackingDTO;
import com.storemanagement.dto.shipment.ShipmentDTO;

public interface ShipmentService {

    ShipmentDTO getShipmentById(Integer shipmentId);

    ShipmentDTO getShipmentByOrderId(Integer orderId);

    ShipmentDTO syncWithGHN(Integer shipmentId);

    GHNTrackingDTO getShipmentTracking(Integer shipmentId);
}