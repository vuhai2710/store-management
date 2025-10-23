package com.storemanagement.repository;

import com.storemanagement.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {
    
    List<PurchaseOrder> findBySupplier_IdSupplier(Integer idSupplier);
    
    List<PurchaseOrder> findByEmployee_IdEmployee(Integer idEmployee);
    
    List<PurchaseOrder> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
