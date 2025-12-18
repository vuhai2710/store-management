package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.order.OrderReturnDTO;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.EmployeeService;
import com.storemanagement.service.OrderReturnService;
import com.storemanagement.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/order-returns")
@RequiredArgsConstructor
public class OrderReturnController {

    private final OrderReturnService orderReturnService;
    private final CustomerService customerService;
    private final EmployeeService employeeService;
    private final SystemSettingService systemSettingService;

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReturnConfig() {
        int allowedDays = systemSettingService.getReturnWindowDays();
        Map<String, Object> config = Map.of(
            "allowedDays", allowedDays
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy cấu hình thành công", config));
    }

    @PostMapping("/orders/{orderId}/return")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderReturnDTO>> requestReturn(
            @PathVariable Integer orderId,
            @RequestBody OrderReturnDTO request) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        OrderReturnDTO result = orderReturnService.requestReturn(customerId, orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo yêu cầu trả hàng thành công", result));
    }

    @PostMapping("/orders/{orderId}/exchange")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderReturnDTO>> requestExchange(
            @PathVariable Integer orderId,
            @RequestBody OrderReturnDTO request) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        OrderReturnDTO result = orderReturnService.requestExchange(customerId, orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo yêu cầu đổi hàng thành công", result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderReturnDTO>> getOrderReturnById(@PathVariable Integer id) {
        OrderReturnDTO result = orderReturnService.getOrderReturnById(id);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));

        if (isCustomer) {
            String username = auth.getName();
            Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
            if (!result.getCreatedByCustomerId().equals(customerId)) {
                throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền xem yêu cầu này");
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin yêu cầu đổi/trả thành công", result));
    }

    @GetMapping("/my-returns")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<OrderReturnDTO>>> getMyReturns(
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<OrderReturnDTO> page = orderReturnService.getMyReturns(customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu cầu đổi/trả thành công", page));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<OrderReturnDTO>>> getAllReturns(
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String returnType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String customerKeyword) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<OrderReturnDTO> page = orderReturnService.getAllReturns(pageable, status, returnType, keyword, customerKeyword);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu cầu đổi/trả thành công", page));
    }

    @GetMapping("/orders/{orderId}/has-active")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Boolean>> hasActiveReturnRequest(@PathVariable Integer orderId) {
        boolean hasActive = orderReturnService.hasActiveReturnRequest(orderId);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra yêu cầu đổi/trả", hasActive));
    }

    @PutMapping("/{idReturn}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderReturnDTO>> approve(
            @PathVariable Integer idReturn,
            @RequestBody OrderReturnDTO request) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Integer employeeId = null;
        boolean isEmployee = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"));

        if (isEmployee) {
            employeeId = employeeService.getMyProfile(username).getIdEmployee();
        }

        BigDecimal refundAmount = request.getRefundAmount();
        String noteAdmin = request.getNoteAdmin();

        OrderReturnDTO result = orderReturnService.approve(idReturn, employeeId, noteAdmin, refundAmount);
        return ResponseEntity.ok(ApiResponse.success("Duyệt yêu cầu đổi/trả thành công", result));
    }

    @PutMapping("/{idReturn}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderReturnDTO>> reject(
            @PathVariable Integer idReturn,
            @RequestBody OrderReturnDTO request) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Integer employeeId = null;
        boolean isEmployee = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"));

        if (isEmployee) {
            employeeId = employeeService.getMyProfile(username).getIdEmployee();
        }

        String noteAdmin = request.getNoteAdmin();

        OrderReturnDTO result = orderReturnService.reject(idReturn, employeeId, noteAdmin);
        return ResponseEntity.ok(ApiResponse.success("Từ chối yêu cầu đổi/trả thành công", result));
    }

    @PutMapping("/{idReturn}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderReturnDTO>> complete(
            @PathVariable Integer idReturn) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Integer employeeId = null;
        boolean isEmployee = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"));

        if (isEmployee) {
            employeeId = employeeService.getMyProfile(username).getIdEmployee();
        }

        OrderReturnDTO result = orderReturnService.complete(idReturn, employeeId);
        return ResponseEntity.ok(ApiResponse.success("Hoàn tất yêu cầu đổi/trả thành công", result));
    }
}