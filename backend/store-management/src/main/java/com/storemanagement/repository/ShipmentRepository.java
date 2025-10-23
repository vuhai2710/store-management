package com.storemanagement.repository;

import com.storemanagement.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {
    
    Optional<Shipment> findByOrder_IdOrder(Integer idOrder);
    
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    
    List<Shipment> findByShippingStatus(Shipment.ShippingStatus shippingStatus);
}
