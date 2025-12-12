package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.inventory.InventoryTransactionDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.service.InventoryTransactionService;
import com.storemanagement.utils.ReferenceType;
import com.storemanagement.utils.TransactionType;
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

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDTO>>> getAllTransactions(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<InventoryTransactionDTO> transactions = inventoryTransactionService.getAllTransactions(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập/xuất kho thành công", transactions));
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDTO>>> getTransactionsByProduct(
            @PathVariable Integer productId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<InventoryTransactionDTO> transactions = 
                inventoryTransactionService.getTransactionsByProduct(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập/xuất kho của sản phẩm thành công", transactions));
    }

    @GetMapping("/reference")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDTO>>> getTransactionsByReference(
            @RequestParam ReferenceType referenceType,
            @RequestParam Integer referenceId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<InventoryTransactionDTO> transactions = 
                inventoryTransactionService.getTransactionsByReference(referenceType, referenceId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập/xuất kho theo reference thành công", transactions));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDTO>>> getTransactionHistory(
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

        PageResponse<InventoryTransactionDTO> transactions;

        // Nếu có productId, lọc theo cả product và thời gian
        if (productId != null) {
            transactions = inventoryTransactionService.getTransactionsByProductAndDateRange(
                    productId, start, end, pageable);
        } else {
            transactions = inventoryTransactionService.getTransactionsByDateRange(start, end, pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập/xuất kho thành công", transactions));
    }

    @GetMapping("/by-type")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDTO>>> getTransactionsByType(
            @RequestParam TransactionType transactionType,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<InventoryTransactionDTO> transactions = 
                inventoryTransactionService.getTransactionsByType(transactionType, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử " + 
                (transactionType == TransactionType.IN ? "nhập kho" : "xuất kho") + " thành công", transactions));
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDTO>>> filterTransactions(
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : LocalDateTime.now();

        PageResponse<InventoryTransactionDTO> transactions = 
                inventoryTransactionService.getTransactionsByMultipleCriteria(
                        transactionType, productId, start, end, pageable);

        return ResponseEntity.ok(ApiResponse.success("Lọc lịch sử nhập/xuất kho thành công", transactions));
    }

    /**
     * Advanced filter with referenceType, productName, sku support
     */
    @GetMapping("/filter-advanced")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDTO>>> filterTransactionsAdvanced(
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) ReferenceType referenceType,
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;

        PageResponse<InventoryTransactionDTO> transactions = 
                inventoryTransactionService.getTransactionsByAdvancedCriteria(
                        transactionType, referenceType, productId, productName, sku, start, end, pageable);

        return ResponseEntity.ok(ApiResponse.success("Lọc lịch sử nhập/xuất kho thành công", transactions));
    }

    /**
     * Unified filter API using Specification pattern.
     * Supports all filter combinations including referenceId for filtering by specific order.
     * All parameters are optional and combined with AND logic.
     * 
     * Example: GET /api/v1/inventory-transactions/search?referenceType=SALE_ORDER&referenceId=123
     * This will return only transactions for order #123
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionDTO>>> searchTransactions(
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) ReferenceType referenceType,
            @RequestParam(required = false) Integer referenceId,
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        LocalDateTime start = fromDate != null ? LocalDateTime.parse(fromDate) : null;
        LocalDateTime end = toDate != null ? LocalDateTime.parse(toDate) : null;

        PageResponse<InventoryTransactionDTO> transactions = 
                inventoryTransactionService.filterTransactions(
                        transactionType, referenceType, referenceId, productId, productName, sku, brand, start, end, pageable);

        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm lịch sử nhập/xuất kho thành công", transactions));
    }
}