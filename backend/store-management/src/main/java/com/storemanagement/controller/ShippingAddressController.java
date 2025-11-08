package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.request.CreateShippingAddressRequestDto;
import com.storemanagement.dto.request.UpdateShippingAddressRequestDto;
import com.storemanagement.dto.response.ShippingAddressDto;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.ShippingAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến Địa chỉ giao hàng (Shipping Address)
 * Base URL: /api/v1/shipping-addresses
 * 
 * Tất cả endpoints yêu cầu authentication với role CUSTOMER
 * Header: Authorization: Bearer {JWT_TOKEN}
 * 
 * Logic:
 * - Customer ID được lấy tự động từ JWT token (username)
 * - Mỗi customer có thể có nhiều địa chỉ giao hàng
 * - Chỉ có một địa chỉ được đánh dấu là mặc định (isDefault = true)
 * - Địa chỉ mặc định được sử dụng khi checkout nếu không chỉ định địa chỉ khác
 * 
 * @author Store Management Team
 */
@RestController
@RequestMapping("/api/v1/shipping-addresses")
@RequiredArgsConstructor
public class ShippingAddressController {

    private final ShippingAddressService shippingAddressService;
    private final CustomerService customerService;

    /**
     * Lấy danh sách tất cả địa chỉ của tôi
     * 
     * Endpoint: GET /api/v1/shipping-addresses
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic:
     * - Lấy customerId từ JWT token
     * - Trả về danh sách địa chỉ, địa chỉ mặc định được sắp xếp lên đầu
     */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ShippingAddressDto>>> getAllAddresses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        List<ShippingAddressDto> addresses = shippingAddressService.getAllAddresses(customerId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách địa chỉ thành công", addresses));
    }

    /**
     * Lấy địa chỉ mặc định
     * 
     * Endpoint: GET /api/v1/shipping-addresses/default
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic:
     * - Lấy địa chỉ có isDefault = true của customer
     * - Nếu không có → 404 Not Found
     */
    @GetMapping("/default")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ShippingAddressDto>> getDefaultAddress() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        ShippingAddressDto address = shippingAddressService.getDefaultAddress(customerId);
        return ResponseEntity.ok(ApiResponse.success("Lấy địa chỉ mặc định thành công", address));
    }

    /**
     * Tạo địa chỉ giao hàng mới
     * 
     * Endpoint: POST /api/v1/shipping-addresses
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong ShippingAddressService):
     * - Validate dữ liệu (recipientName, phoneNumber, address)
     * - Nếu set làm default → Unset tất cả địa chỉ default khác
     * - Tạo địa chỉ mới
     * - Đảm bảo chỉ có một địa chỉ mặc định tại một thời điểm
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ShippingAddressDto>> createAddress(
            @RequestBody @Valid CreateShippingAddressRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        ShippingAddressDto address = shippingAddressService.createAddress(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo địa chỉ thành công", address));
    }

    /**
     * Cập nhật địa chỉ giao hàng
     * 
     * Endpoint: PUT /api/v1/shipping-addresses/{addressId}
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong ShippingAddressService):
     * - Kiểm tra địa chỉ tồn tại và thuộc về customer hiện tại
     * - Cập nhật recipientName, phoneNumber, address
     * - Không thể thay đổi isDefault qua endpoint này (phải dùng /set-default)
     */
    @PutMapping("/{addressId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ShippingAddressDto>> updateAddress(
            @PathVariable Integer addressId,
            @RequestBody @Valid UpdateShippingAddressRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        ShippingAddressDto address = shippingAddressService.updateAddress(customerId, addressId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật địa chỉ thành công", address));
    }

    /**
     * Đặt địa chỉ làm mặc định
     * 
     * Endpoint: PUT /api/v1/shipping-addresses/{addressId}/set-default
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong ShippingAddressService):
     * - Kiểm tra địa chỉ tồn tại và thuộc về customer hiện tại
     * - Unset tất cả địa chỉ mặc định khác
     * - Set địa chỉ này làm mặc định
     * - Đảm bảo chỉ có một địa chỉ mặc định tại một thời điểm
     */
    @PutMapping("/{addressId}/set-default")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ShippingAddressDto>> setDefaultAddress(@PathVariable Integer addressId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        ShippingAddressDto address = shippingAddressService.setDefaultAddress(customerId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Đặt địa chỉ mặc định thành công", address));
    }

    /**
     * Xóa địa chỉ giao hàng
     * 
     * Endpoint: DELETE /api/v1/shipping-addresses/{addressId}
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong ShippingAddressService):
     * - Kiểm tra địa chỉ tồn tại và thuộc về customer hiện tại
     * - Kiểm tra địa chỉ mặc định: Không cho phép xóa địa chỉ mặc định duy nhất
     * - Xóa địa chỉ khỏi database
     */
    @DeleteMapping("/{addressId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Integer addressId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        shippingAddressService.deleteAddress(customerId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Xóa địa chỉ thành công", null));
    }
}




