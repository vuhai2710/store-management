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
}