package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.request.AddToCartRequestDto;
import com.storemanagement.dto.request.UpdateCartItemRequestDto;
import com.storemanagement.dto.response.CartDto;
import com.storemanagement.service.CartService;
import com.storemanagement.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API liên quan đến Giỏ hàng (Cart)
 * Base URL: /api/v1/cart
 * 
 * Tất cả endpoints yêu cầu authentication với role CUSTOMER
 * Header: Authorization: Bearer {JWT_TOKEN}
 * 
 * Logic:
 * - Customer ID được lấy tự động từ JWT token (username)
 * - Giỏ hàng được tự động tạo nếu chưa tồn tại
 * - Mỗi customer chỉ có 1 giỏ hàng duy nhất
 * 
 * @author Store Management Team
 */
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final CustomerService customerService;

    /**
     * Lấy giỏ hàng của tôi
     * 
     * Endpoint: GET /api/v1/cart
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic:
     * - Lấy customerId từ JWT token (username)
     * - Lấy hoặc tạo giỏ hàng (nếu chưa có)
     * - Trả về CartDto với danh sách items và tổng tiền
     */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartDto>> getCart() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        CartDto cart = cartService.getCart(customerId);
        return ResponseEntity.ok(ApiResponse.success("Lấy giỏ hàng thành công", cart));
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * 
     * Endpoint: POST /api/v1/cart/items
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong CartService):
     * - Validate sản phẩm tồn tại và còn khả dụng (status = IN_STOCK)
     * - Validate tồn kho đủ (stockQuantity >= quantity)
     * - Nếu sản phẩm đã có trong giỏ → Cộng thêm quantity
     * - Nếu chưa có → Tạo cart item mới
     * - Trả về giỏ hàng đã được cập nhật
     */
    @PostMapping("/items")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartDto>> addToCart(@RequestBody @Valid AddToCartRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        CartDto cart = cartService.addToCart(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm vào giỏ hàng thành công", cart));
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     * 
     * Endpoint: PUT /api/v1/cart/items/{itemId}
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong CartService):
     * - Kiểm tra cart item tồn tại và thuộc về customer hiện tại
     * - Validate tồn kho đủ cho số lượng mới
     * - Cập nhật quantity
     * - Trả về giỏ hàng đã được cập nhật
     */
    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartDto>> updateCartItem(
            @PathVariable Integer itemId,
            @RequestBody @Valid UpdateCartItemRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        CartDto cart = cartService.updateCartItem(customerId, itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật giỏ hàng thành công", cart));
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     * 
     * Endpoint: DELETE /api/v1/cart/items/{itemId}
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong CartService):
     * - Kiểm tra cart item tồn tại và thuộc về customer hiện tại
     * - Xóa cart item khỏi database
     * - Trả về giỏ hàng đã được cập nhật
     */
    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartDto>> removeCartItem(@PathVariable Integer itemId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();
        
        CartDto cart = cartService.removeCartItem(customerId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm khỏi giỏ hàng thành công", cart));
    }

    /**
     * Xóa toàn bộ giỏ hàng
     * 
     * Endpoint: DELETE /api/v1/cart
     * Authentication: Required (CUSTOMER role)
     * 
     * Logic xử lý (trong CartService):
     * - Xóa tất cả cart items trong giỏ hàng
     * - Giỏ hàng vẫn tồn tại, chỉ xóa các items
     */
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




