package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.cart.AddToCartRequestDto;
import com.storemanagement.dto.cart.UpdateCartItemRequestDto;
import com.storemanagement.dto.cart.CartDTO;
import com.storemanagement.service.CartService;
import com.storemanagement.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartDTO>> getCart() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        CartDTO cart = cartService.getCart(customerId);
        return ResponseEntity.ok(ApiResponse.success("Lấy giỏ hàng thành công", cart));
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartDTO>> addToCart(@RequestBody @Valid AddToCartRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        CartDTO cart = cartService.addToCart(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm vào giỏ hàng thành công", cart));
    }

    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartDTO>> updateCartItem(
            @PathVariable Integer itemId,
            @RequestBody @Valid UpdateCartItemRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        CartDTO cart = cartService.updateCartItem(customerId, itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật giỏ hàng thành công", cart));
    }

    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartDTO>> removeCartItem(@PathVariable Integer itemId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        CartDTO cart = cartService.removeCartItem(customerId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm khỏi giỏ hàng thành công", cart));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        cartService.clearCart(customerId);
        return ResponseEntity.ok(ApiResponse.success("Xóa giỏ hàng thành công", null));
    }
}




