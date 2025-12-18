package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.supplier.SupplierDTO;
import com.storemanagement.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<SupplierDTO>>> getAllSuppliers() {
        List<SupplierDTO> suppliers = supplierService.getAllSuppliers();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhà cung cấp thành công", suppliers));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<SupplierDTO>>> getAllSuppliersPaginated(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idSupplier") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) String keyword) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<SupplierDTO> supplierPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            supplierPage = supplierService.searchSuppliersByName(keyword, pageable);
        } else {
            supplierPage = supplierService.getAllSuppliersPaginated(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhà cung cấp thành công", supplierPage));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<SupplierDTO>> getSupplierById(@PathVariable Integer id) {
        SupplierDTO supplier = supplierService.getSupplierById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin nhà cung cấp thành công", supplier));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<SupplierDTO>>> searchSuppliersByName(
            @RequestParam String name,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idSupplier") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<SupplierDTO> supplierPage = supplierService.searchSuppliersByName(name, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm nhà cung cấp thành công", supplierPage));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<SupplierDTO>> createSupplier(@RequestBody @Valid SupplierDTO supplierDto) {
        SupplierDTO createdSupplier = supplierService.createSupplier(supplierDto);
        return ResponseEntity.ok(ApiResponse.success("Thêm nhà cung cấp thành công", createdSupplier));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<SupplierDTO>> updateSupplier(
            @PathVariable Integer id,
            @RequestBody @Valid SupplierDTO supplierDto) {
        SupplierDTO updatedSupplier = supplierService.updateSupplier(id, supplierDto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật nhà cung cấp thành công", updatedSupplier));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Integer id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa nhà cung cấp thành công", null));
    }
}
