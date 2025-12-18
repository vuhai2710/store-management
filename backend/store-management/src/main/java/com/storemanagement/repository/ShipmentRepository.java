package com.storemanagement.repository;

import com.storemanagement.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {
    Optional<Shipment> findByOrder_IdOrder(Integer orderId);

    Optional<Shipment> findByGhnOrderCode(String ghnOrderCode);
}
