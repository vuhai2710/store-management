package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.CustomerDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<CustomerDto>>> getAllCustomers(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "5") Integer pageSize,
            @RequestParam(defaultValue = "idCustomer") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<CustomerDto> customerPage = customerService.getAllCustomersPaginated(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách customer thành công", customerPage));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<CustomerDto>> getCustomerById(@PathVariable Integer id) {
        CustomerDto customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin customer thành công", customer));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<CustomerDto>>> searchCustomersByNameAndPhone(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "5") Integer pageSize,
            @RequestParam(defaultValue = "idCustomer") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo-1, pageSize, Sort.by(direction, sortBy));

        PageResponse<CustomerDto> customerPage = customerService.searchCustomersPaginated(name, phone, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm customer thành công", customerPage));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<CustomerDto>>> getCustomersByType(
            @PathVariable String type,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "5") Integer pageSize,
            @RequestParam(defaultValue = "idCustomer") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<CustomerDto> customerPage = customerService.getCustomersByTypePaginated(type, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách customer theo loại thành công", customerPage));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<CustomerDto>> updateCustomer(
            @PathVariable Integer id,
            @RequestBody @Valid CustomerDto customerDto) {
        CustomerDto updatedCustomer = customerService.updateCustomer(id, customerDto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật customer thành công", updatedCustomer));
    }

    @PatchMapping("/{id}/upgrade-vip")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerDto>> upgradeToVip(@PathVariable Integer id) {
        CustomerDto customer = customerService.upgradeToVip(id);
        return ResponseEntity.ok(ApiResponse.success("Nâng cấp customer lên VIP thành công", customer));
    }

    @PatchMapping("/{id}/downgrade-regular")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerDto>> downgradeToRegular(@PathVariable Integer id) {
        CustomerDto customer = customerService.downgradeToRegular(id);
        return ResponseEntity.ok(ApiResponse.success("Hạ cấp customer xuống REGULAR thành công", customer));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa customer thành công", null));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerDto>> updateMyCustomerInfo(
            @RequestBody @Valid CustomerDto customerDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        CustomerDto updatedCustomer = customerService.updateMyCustomerInfo(username, customerDto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", updatedCustomer));
    }
}

