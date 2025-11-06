package com.storemanagement.repository;

import com.storemanagement.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {
    /**
     * Tìm shipment theo orderId
     * @param orderId ID của order
     * @return Optional<Shipment>
     */
    Optional<Shipment> findByOrder_IdOrder(Integer orderId);
}

