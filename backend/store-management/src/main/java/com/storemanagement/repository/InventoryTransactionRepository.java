package com.storemanagement.repository;

import com.storemanagement.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Integer> {
    
    List<InventoryTransaction> findByProduct_IdProduct(Integer idProduct);
    
    List<InventoryTransaction> findByTransactionType(InventoryTransaction.TransactionType transactionType);
    
    List<InventoryTransaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<InventoryTransaction> findByReferenceTypeAndReferenceId(
        InventoryTransaction.ReferenceType referenceType, Integer referenceId);
}
