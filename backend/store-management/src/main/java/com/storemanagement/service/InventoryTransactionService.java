package com.storemanagement.service;

import com.storemanagement.dto.response.InventoryTransactionDto;
import com.storemanagement.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface InventoryTransactionService {

    /**
     * Lấy tất cả inventory transactions với phân trang
     * Sắp xếp theo transaction_date DESC
     */
    PageResponse<InventoryTransactionDto> getAllTransactions(Pageable pageable);

    /**
     * Lấy transactions của một sản phẩm
     */
    PageResponse<InventoryTransactionDto> getTransactionsByProduct(Integer productId, Pageable pageable);

    /**
     * Lấy transactions theo reference_type và reference_id
     */
    PageResponse<InventoryTransactionDto> getTransactionsByReference(
            com.storemanagement.utils.ReferenceType referenceType,
            Integer referenceId,
            Pageable pageable
    );

    /**
     * Lấy transactions trong khoảng thời gian
     */
    PageResponse<InventoryTransactionDto> getTransactionsByDateRange(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * Lấy transactions của sản phẩm trong khoảng thời gian
     */
    PageResponse<InventoryTransactionDto> getTransactionsByProductAndDateRange(
            Integer productId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );
}






















