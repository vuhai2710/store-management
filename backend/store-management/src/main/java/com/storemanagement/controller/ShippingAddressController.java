package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.shipment.CreateShippingAddressRequestDto;
import com.storemanagement.dto.shipment.UpdateShippingAddressRequestDto;
import com.storemanagement.dto.shipment.ShippingAddressDTO;
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

@RestController
@RequestMapping("/api/v1/shipping-addresses")
@RequiredArgsConstructor
public class ShippingAddressController {

    private final ShippingAddressService shippingAddressService;
    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ShippingAddressDTO>>> getAllAddresses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        List<ShippingAddressDTO> addresses = shippingAddressService.getAllAddresses(customerId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách địa chỉ thành công", addresses));
    }

    @GetMapping("/default")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ShippingAddressDTO>> getDefaultAddress() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        ShippingAddressDTO address = shippingAddressService.getDefaultAddress(customerId);
        return ResponseEntity.ok(ApiResponse.success("Lấy địa chỉ mặc định thành công", address));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ShippingAddressDTO>> createAddress(
            @RequestBody @Valid CreateShippingAddressRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        ShippingAddressDTO address = shippingAddressService.createAddress(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo địa chỉ thành công", address));
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ShippingAddressDTO>> updateAddress(
            @PathVariable Integer addressId,
            @RequestBody @Valid UpdateShippingAddressRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        ShippingAddressDTO address = shippingAddressService.updateAddress(customerId, addressId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật địa chỉ thành công", address));
    }

    @PutMapping("/{addressId}/set-default")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ShippingAddressDTO>> setDefaultAddress(@PathVariable Integer addressId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        ShippingAddressDTO address = shippingAddressService.setDefaultAddress(customerId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Đặt địa chỉ mặc định thành công", address));
    }

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
