package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.request.BuyNowRequestDto;
import com.storemanagement.dto.request.CreateOrderForCustomerRequestDto;
import com.storemanagement.dto.request.CreateOrderRequestDto;
import com.storemanagement.dto.response.OrderDto;
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

    /**
     * Xem chi tiết đơn hàng
     * GET /api/v1/orders/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Integer id) {
        OrderDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng thành công", order));
    }

    /**
     * Xuất/In hóa đơn bán hàng ra PDF
     * GET /api/v1/orders/{id}/pdf
     */
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

    /**
     * Customer: Tạo order từ cart (checkout)
     * 
     * Endpoint: POST /api/v1/orders/checkout
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong OrderService):
     * 1. Validate giỏ hàng không rỗng và tất cả sản phẩm còn khả dụng
     * 2. Xử lý địa chỉ giao hàng (shippingAddressId hoặc default hoặc customer.address)
     * 3. Tạo snapshot của địa chỉ và sản phẩm để bảo vệ khỏi thay đổi sau này
     * 4. Tính tổng tiền và tạo order với status = PENDING
     * 5. Tạo order details với snapshot (productName, productCode, productImage, price)
     * 6. Trừ số lượng từ product.stockQuantity và cập nhật status nếu hết hàng
     * 7. Tạo inventory transactions để ghi lại lịch sử
     * 8. Xóa giỏ hàng sau khi tạo order thành công
     */
    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(@RequestBody @Valid CreateOrderRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        OrderDto order = orderService.createOrderFromCart(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Đặt hàng thành công", order));
    }

    /**
     * Customer: Tạo order trực tiếp từ sản phẩm (Buy Now)
     * 
     * Endpoint: POST /api/v1/orders/buy-now
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong OrderService):
     * 1. Validate sản phẩm tồn tại và còn khả dụng
     * 2. Validate tồn kho đủ
     * 3. Xử lý địa chỉ giao hàng (shippingAddressId hoặc default hoặc customer.address)
     * 4. Tạo order với 1 order detail
     * 5. Trừ tồn kho và tạo inventory transaction
     * 
     * Lưu ý: Không xóa giỏ hàng vì không sử dụng giỏ hàng
     */
    @PostMapping("/buy-now")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderDto>> buyNow(@RequestBody @Valid BuyNowRequestDto request) {
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
        OrderDto order = orderService.createOrderDirectly(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Đặt hàng thành công", order));
    }

    /**
     * Admin/Employee: Tạo order cho khách hàng (có thể không có tài khoản)
     * 
     * Endpoint: POST /api/v1/orders/create-for-customer
     * Authentication: Required (ADMIN, EMPLOYEE role)
     * 
     * Logic xử lý (trong OrderService):
     * 1. Nếu có customerId → Sử dụng customer có sẵn
     * 2. Nếu không có customerId → Tạo Customer mới không có User (walk-in customer)
     * 3. Lấy employee từ authentication
     * 4. Validate tất cả sản phẩm trong danh sách
     * 5. Tạo order với employee và customer
     * 6. Tạo order details với snapshot
     * 7. Trừ tồn kho và tạo inventory transactions
     * 8. Hỗ trợ discount (cho phép admin/employee nhập discount)
     */
    @PostMapping("/create-for-customer")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<OrderDto>> createOrderForCustomer(@RequestBody @Valid CreateOrderForCustomerRequestDto request) {
        // Lấy thông tin employee từ JWT token
        // Employee này là người tạo đơn hàng (được lưu vào order.employee)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer employeeId = employeeService.getMyProfile(username).getIdEmployee();
        
        // Tạo đơn hàng cho khách hàng (có thể là walk-in customer)
        // Method này sẽ:
        // - Xử lý customer: sử dụng customerId có sẵn hoặc tạo customer mới (walk-in)
        // - Validate tất cả sản phẩm trong danh sách
        // - Tính tổng tiền và áp dụng discount
        // - Tạo order với employee và customer
        // - Trừ tồn kho và tạo inventory transactions
        OrderDto order = orderService.createOrderForCustomer(employeeId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn hàng thành công", order));
    }

    /**
     * Customer: Lấy danh sách order của tôi
     * 
     * Endpoint: GET /api/v1/orders/my-orders
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic:
     * - Lấy customerId từ JWT token
     * - Chỉ trả về đơn hàng của customer hiện tại
     * - Sắp xếp mặc định theo orderDate DESC (mới nhất trước)
     * - Có phân trang và sorting
     */
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> getMyOrders(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));
        
        PageResponse<OrderDto> orders = orderService.getMyOrders(customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", orders));
    }

    /**
     * Customer: Xem chi tiết order của tôi
     * 
     * Endpoint: GET /api/v1/orders/my-orders/{orderId}
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic:
     * - Kiểm tra order tồn tại và thuộc về customer hiện tại
     * - Trả về OrderDto đầy đủ với order details (có snapshot fields)
     * - Snapshot đảm bảo hiển thị đúng thông tin tại thời điểm mua
     */
    @GetMapping("/my-orders/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderDto>> getMyOrderById(@PathVariable Integer orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        OrderDto order = orderService.getMyOrderById(customerId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng thành công", order));
    }

    /**
     * Customer: Hủy order
     * 
     * Endpoint: PUT /api/v1/orders/my-orders/{orderId}/cancel
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong OrderService):
     * 1. Kiểm tra order tồn tại và thuộc về customer hiện tại
     * 2. Chỉ cho phép hủy khi status = PENDING
     * 3. Hoàn trả hàng vào kho: Cộng lại số lượng vào product.stockQuantity
     * 4. Tạo inventory transactions (IN) để ghi lại lịch sử hoàn trả
     * 5. Cập nhật order status = CANCELED
     * 
     * Lưu ý: Đơn hàng đã được xác nhận hoặc hoàn thành không thể hủy
     */
    @PutMapping("/my-orders/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(@PathVariable Integer orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        OrderDto order = orderService.cancelOrder(customerId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng thành công", order));
    }
}




