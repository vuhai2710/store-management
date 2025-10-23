package com.storemanagement.repository;

import com.storemanagement.entity.PurchaseOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderDetailRepository extends JpaRepository<PurchaseOrderDetail, Integer> {
    
    List<PurchaseOrderDetail> findByPurchaseOrder_IdPurchaseOrder(Integer idPurchaseOrder);
}
