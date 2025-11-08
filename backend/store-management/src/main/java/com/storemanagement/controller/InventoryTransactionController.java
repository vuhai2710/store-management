package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.response.InventoryTransactionDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.service.InventoryTransactionService;
import com.storemanagement.utils.ReferenceType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
@RestController
@RequestMapping("/api/v1/inventory-transactions")
@RequiredArgsConstructor
public class InventoryTransactionController {

    private final InventoryTransactionService inventoryTransactionService;

    /**
     * Lấy tất cả lịch sử nhập/xuất kho (phân trang)
     * GET /api/v1/inventory-transactions
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDto>>> getAllTransactions(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<InventoryTransactionDto> transactions = inventoryTransactionService.getAllTransactions(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập/xuất kho thành công", transactions));
    }

    /**
     * Lấy lịch sử nhập/xuất kho của một sản phẩm
     * GET /api/v1/inventory-transactions/product/{productId}
     */
    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDto>>> getTransactionsByProduct(
            @PathVariable Integer productId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<InventoryTransactionDto> transactions = 
                inventoryTransactionService.getTransactionsByProduct(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập/xuất kho của sản phẩm thành công", transactions));
    }

    /**
     * Lấy transactions theo reference_type và reference_id
     * GET /api/v1/inventory-transactions/reference?referenceType=PURCHASE_ORDER&referenceId=1
     */
    @GetMapping("/reference")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDto>>> getTransactionsByReference(
            @RequestParam ReferenceType referenceType,
            @RequestParam Integer referenceId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<InventoryTransactionDto> transactions = 
                inventoryTransactionService.getTransactionsByReference(referenceType, referenceId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập/xuất kho theo reference thành công", transactions));
    }

    /**
     * Lấy lịch sử nhập/xuất kho trong khoảng thời gian
     * GET /api/v1/inventory-transactions/history?startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDto>>> getTransactionHistory(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : LocalDateTime.now();

        PageResponse<InventoryTransactionDto> transactions;

        // Nếu có productId, lọc theo cả product và thời gian
        if (productId != null) {
            transactions = inventoryTransactionService.getTransactionsByProductAndDateRange(
                    productId, start, end, pageable);
        } else {
            transactions = inventoryTransactionService.getTransactionsByDateRange(start, end, pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập/xuất kho thành công", transactions));
    }
}






















