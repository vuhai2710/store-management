package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.order.OrderDTO;
import com.storemanagement.model.Order;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.EmployeeService;
import com.storemanagement.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final CustomerService customerService;
    private final EmployeeService employeeService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable Integer id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng thành công", order));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<byte[]> exportOrderToPdf(@PathVariable Integer id) {
        byte[] pdfBytes = orderService.exportOrderToPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "hoa-don-" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderDTO>> checkout(@RequestBody @Valid OrderDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        OrderDTO order = orderService.createOrderFromCart(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Đặt hàng thành công", order));
    }

    @PostMapping("/buy-now")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderDTO>> buyNow(@RequestBody @Valid OrderDTO request) {
        // Lấy thông tin customer từ JWT token
        // JWT token chứa username, từ đó lấy customerId
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        // Tạo đơn hàng trực tiếp từ sản phẩm (không qua giỏ hàng)
        // Method này sẽ:
        // - Validate sản phẩm và tồn kho
        // - Tạo order với 1 order detail
        // - Trừ tồn kho và tạo inventory transaction
        // - Không xóa giỏ hàng (vì không sử dụng giỏ hàng)
        OrderDTO order = orderService.createOrderDirectly(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Đặt hàng thành công", order));
    }

    @PostMapping("/create-for-customer")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderDTO>> createOrderForCustomer(@RequestBody @Valid OrderDTO request) {
        // Lấy thông tin employee từ JWT token
        // Employee này là người tạo đơn hàng (được lưu vào order.employee)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        //Chỉ lây employeeId nếu user có role EMPLOYEE
        Integer employeeId = null;
        boolean isEmployee = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"));

        if (isEmployee) { //ADMIN -> employeeId = null
            employeeId = employeeService.getMyProfile(username).getIdEmployee();
        }

        // Tạo đơn hàng cho khách hàng (có thể là walk-in customer)
        // Method này sẽ:
        // - Xử lý customer: sử dụng customerId có sẵn hoặc tạo customer mới (walk-in)
        // - Validate tất cả sản phẩm trong danh sách
        // - Tính tổng tiền và áp dụng discount
        // - Tạo order với employee và customer
        // - Trừ tồn kho và tạo inventory transactions
        OrderDTO order = orderService.createOrderForCustomer(employeeId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn hàng thành công", order));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<OrderDTO>>> getMyOrders(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));
        
        // Parse status string thành Order.OrderStatus enum (nếu có)
        Order.OrderStatus orderStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ: " + status + ". Các giá trị hợp lệ: PENDING, CONFIRMED, COMPLETED, CANCELED");
            }
        }
        
        PageResponse<OrderDTO> orders = orderService.getMyOrders(customerId, orderStatus, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", orders));
    }

    @GetMapping("/my-orders/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderDTO>> getMyOrderById(@PathVariable Integer orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        OrderDTO order = orderService.getMyOrderById(customerId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng thành công", order));
    }

    @PutMapping("/my-orders/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(@PathVariable Integer orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        OrderDTO order = orderService.cancelOrder(customerId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng thành công", order));
    }

    @PutMapping("/my-orders/{orderId}/confirm-delivery")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderDTO>> confirmDelivery(@PathVariable Integer orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        OrderDTO order = orderService.confirmDelivery(customerId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận nhận hàng thành công", order));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<OrderDTO>>> getAllOrders(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer customerId) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        // Parse status string thành Order.OrderStatus enum (nếu có)
        Order.OrderStatus orderStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ: " + status +
                        ". Các giá trị hợp lệ: PENDING, CONFIRMED, COMPLETED, CANCELED");
            }
        }

        PageResponse<OrderDTO> orders = orderService.getAllOrders(orderStatus, customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", orders));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Integer id,
            @RequestBody @Valid OrderDTO request) {

        OrderDTO order = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn hàng thành công", order));
    }
}