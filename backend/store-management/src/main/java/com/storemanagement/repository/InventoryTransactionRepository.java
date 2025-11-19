package com.storemanagement.repository;

import com.storemanagement.model.InventoryTransaction;
import com.storemanagement.utils.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Integer> {

    Page<InventoryTransaction> findByProduct_IdProduct(Integer productId, Pageable pageable);

    Page<InventoryTransaction> findByReferenceTypeAndReferenceId(
            com.storemanagement.utils.ReferenceType referenceType,
            Integer referenceId,
            Pageable pageable
    );

    Page<InventoryTransaction> findByTransactionDateBetween(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT it FROM InventoryTransaction it " +
           "WHERE it.product.idProduct = :productId " +
           "AND it.transactionDate BETWEEN :startDate AND :endDate " +
           "ORDER BY it.transactionDate DESC")
    Page<InventoryTransaction> findByProductAndDateRange(
            @Param("productId") Integer productId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    Page<InventoryTransaction> findAllByOrderByTransactionDateDesc(Pageable pageable);

    Page<InventoryTransaction> findByTransactionType(TransactionType transactionType, Pageable pageable);

    Page<InventoryTransaction> findByTransactionTypeAndProduct_IdProduct(
            TransactionType transactionType,
            Integer productId,
            Pageable pageable
    );

    Page<InventoryTransaction> findByTransactionTypeAndTransactionDateBetween(
            TransactionType transactionType,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT it FROM InventoryTransaction it " +
           "WHERE (:transactionType IS NULL OR it.transactionType = :transactionType) " +
           "AND (:productId IS NULL OR it.product.idProduct = :productId) " +
           "AND it.transactionDate BETWEEN :startDate AND :endDate " +
           "ORDER BY it.transactionDate DESC")
    Page<InventoryTransaction> findByMultipleCriteria(
            @Param("transactionType") TransactionType transactionType,
            @Param("productId") Integer productId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}