package com.storemanagement.repository;

import com.storemanagement.model.InventoryTransaction;
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
}























