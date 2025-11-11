package com.storemanagement.service;

import com.storemanagement.dto.inventory.InventoryTransactionDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.utils.TransactionType;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface InventoryTransactionService {

    /**
     * Lấy tất cả inventory transactions với phân trang
     * Sắp xếp theo transaction_date DESC
     */
    PageResponse<InventoryTransactionDTO> getAllTransactions(Pageable pageable);

    /**
     * Lấy transactions của một sản phẩm
     */
    PageResponse<InventoryTransactionDTO> getTransactionsByProduct(Integer productId, Pageable pageable);

    /**
     * Lấy transactions theo reference_type và reference_id
     */
    PageResponse<InventoryTransactionDTO> getTransactionsByReference(
            com.storemanagement.utils.ReferenceType referenceType,
            Integer referenceId,
            Pageable pageable
    );

    /**
     * Lấy transactions trong khoảng thời gian
     */
    PageResponse<InventoryTransactionDTO> getTransactionsByDateRange(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Lấy transactions của sản phẩm trong khoảng thời gian
     */
    PageResponse<InventoryTransactionDTO> getTransactionsByProductAndDateRange(
            Integer productId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Lấy transactions theo loại giao dịch (IN/OUT)
     */
    PageResponse<InventoryTransactionDTO> getTransactionsByType(
            TransactionType transactionType,
            Pageable pageable
    );

    /**
     * Lấy transactions theo nhiều criteria
     * Hỗ trợ filter theo: transactionType, productId, dateRange
     * Tất cả params có thể null (trừ startDate, endDate)
     */
    PageResponse<InventoryTransactionDTO> getTransactionsByMultipleCriteria(
            TransactionType transactionType,
            Integer productId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );
}






















