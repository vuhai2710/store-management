package com.storemanagement.service;

import com.storemanagement.dto.inventory.InventoryTransactionDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.utils.TransactionType;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface InventoryTransactionService {

    PageResponse<InventoryTransactionDTO> getAllTransactions(Pageable pageable);

    PageResponse<InventoryTransactionDTO> getTransactionsByProduct(Integer productId, Pageable pageable);

    PageResponse<InventoryTransactionDTO> getTransactionsByReference(
            com.storemanagement.utils.ReferenceType referenceType,
            Integer referenceId,
            Pageable pageable
    );

    PageResponse<InventoryTransactionDTO> getTransactionsByDateRange(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    PageResponse<InventoryTransactionDTO> getTransactionsByProductAndDateRange(
            Integer productId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    PageResponse<InventoryTransactionDTO> getTransactionsByType(
            TransactionType transactionType,
            Pageable pageable
    );

    PageResponse<InventoryTransactionDTO> getTransactionsByMultipleCriteria(
            TransactionType transactionType,
            Integer productId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Advanced filter with referenceType, productName, sku support
     */
    PageResponse<InventoryTransactionDTO> getTransactionsByAdvancedCriteria(
            TransactionType transactionType,
            com.storemanagement.utils.ReferenceType referenceType,
            Integer productId,
            String productName,
            String sku,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Filter transactions using Specification pattern for flexible querying.
     * Supports all filter combinations with AND logic.
     * 
     * @param transactionType Transaction type (IN/OUT) - optional
     * @param referenceType Reference type (PURCHASE_ORDER, SALE_ORDER, etc.) - optional
     * @param referenceId Specific reference ID - optional (used for filtering by specific order/purchase)
     * @param productId Product ID - optional
     * @param productName Product name (partial match) - optional
     * @param sku SKU code (partial match) - optional
     * @param brand Product brand (exact match) - optional
     * @param fromDate Start date range - optional
     * @param toDate End date range - optional
     * @param pageable Pagination info
     * @return Paginated list of transactions matching all provided criteria
     */
    PageResponse<InventoryTransactionDTO> filterTransactions(
            TransactionType transactionType,
            com.storemanagement.utils.ReferenceType referenceType,
            Integer referenceId,
            Integer productId,
            String productName,
            String sku,
            String brand,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    );
}