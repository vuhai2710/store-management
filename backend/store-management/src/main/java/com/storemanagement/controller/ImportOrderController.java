package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.ImportOrderDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.service.ImportOrderService;
import com.storemanagement.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/import-orders")
@RequiredArgsConstructor
public class ImportOrderController {

    private final ImportOrderService importOrderService;

    /**
     * Tạo đơn nhập hàng mới
     * POST /api/v1/import-orders
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ImportOrderDto>> createImportOrder(
            @RequestBody @Valid ImportOrderDto importOrderDto) {
        
        // Lấy employee ID từ JWT token (không cần query database)
        Integer employeeId = SecurityUtils.getCurrentEmployeeId().orElse(null);
        
        ImportOrderDto createdOrder = importOrderService.createImportOrder(importOrderDto, employeeId);
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn nhập hàng thành công", createdOrder));
    }

    /**
     * Xem chi tiết đơn nhập hàng
     * GET /api/v1/import-orders/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ImportOrderDto>> getImportOrderById(@PathVariable Integer id) {
        ImportOrderDto order = importOrderService.getImportOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn nhập hàng thành công", order));
    }

    /**
     * Lấy danh sách đơn nhập hàng (có phân trang)
     * GET /api/v1/import-orders
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ImportOrderDto>>> getAllImportOrders(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idImportOrder") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ImportOrderDto> orders = importOrderService.getAllImportOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn nhập hàng thành công", orders));
    }

    /**
     * Lấy danh sách đơn nhập hàng theo supplier
     * GET /api/v1/import-orders/supplier/{supplierId}
     */
    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ImportOrderDto>>> getImportOrdersBySupplier(
            @PathVariable Integer supplierId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idImportOrder") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ImportOrderDto> orders = importOrderService.getImportOrdersBySupplier(supplierId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn nhập hàng theo nhà cung cấp thành công", orders));
    }

    /**
     * Lấy lịch sử nhập hàng trong khoảng thời gian
     * GET /api/v1/import-orders/history?startDate=2025-01-01T00:00:00&endDate=2025-01-31T23:59:59
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ImportOrderDto>>> getImportOrderHistory(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer supplierId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idImportOrder") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : LocalDateTime.now();

        PageResponse<ImportOrderDto> orders;
        
        // Nếu có supplierId, lọc theo cả supplier và thời gian
        if (supplierId != null) {
            orders = importOrderService.getImportOrdersBySupplierAndDateRange(supplierId, start, end, pageable);
        } else {
            orders = importOrderService.getImportOrdersByDateRange(start, end, pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử nhập hàng thành công", orders));
    }

    /**
     * Xuất/In phiếu nhập hàng ra PDF
     * GET /api/v1/import-orders/{id}/pdf
     */
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<byte[]> exportImportOrderToPdf(@PathVariable Integer id) {
        byte[] pdfBytes = importOrderService.exportImportOrderToPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "phieu-nhap-hang-" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

}

