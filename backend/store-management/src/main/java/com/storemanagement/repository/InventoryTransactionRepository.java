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

    /**
     * Tìm tất cả transactions của một sản phẩm
     */
    Page<InventoryTransaction> findByProduct_IdProduct(Integer productId, Pageable pageable);

    /**
     * Tìm transactions theo reference_type và reference_id
     */
    Page<InventoryTransaction> findByReferenceTypeAndReferenceId(
            com.storemanagement.utils.ReferenceType referenceType,
            Integer referenceId,
            Pageable pageable
    );

    /**
     * Tìm transactions trong khoảng thời gian
     */
    Page<InventoryTransaction> findByTransactionDateBetween(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Tìm transactions của sản phẩm trong khoảng thời gian
     */
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

    /**
     * Tìm tất cả transactions, sắp xếp theo transaction_date DESC
     */
    Page<InventoryTransaction> findAllByOrderByTransactionDateDesc(Pageable pageable);

    /**
     * Tìm transactions theo loại giao dịch (IN/OUT)
     */
    Page<InventoryTransaction> findByTransactionType(TransactionType transactionType, Pageable pageable);

    /**
     * Tìm transactions theo loại giao dịch và sản phẩm
     */
    Page<InventoryTransaction> findByTransactionTypeAndProduct_IdProduct(
            TransactionType transactionType,
            Integer productId,
            Pageable pageable
    );

    /**
     * Tìm transactions theo loại giao dịch trong khoảng thời gian
     */
    Page<InventoryTransaction> findByTransactionTypeAndTransactionDateBetween(
            TransactionType transactionType,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Tìm transactions theo nhiều criteria với query tùy chỉnh
     * Hỗ trợ filter theo: transactionType, productId, dateRange
     */
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




































