package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.product.ProductRecommendationDTO;
import com.storemanagement.model.Customer;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.service.ProductRecommendationService;
import com.storemanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controller xử lý các API liên quan đến gợi ý sản phẩm
 * Base URL: /api/v1/products/recommendations
 * 
 * Sử dụng Content-based Filtering với Python script
 */
@RestController
@RequestMapping("/api/v1/products/recommendations")
@RequiredArgsConstructor
@Slf4j
public class ProductRecommendationController {

    private final ProductRecommendationService recommendationService;
    private final CustomerRepository customerRepository;

    /**
     * Lấy danh sách sản phẩm tương tự cho một sản phẩm
     * 
     * Endpoint: GET /api/v1/products/recommendations/{productId}
     * Query Parameters:
     *   - topN: Số lượng sản phẩm tương tự cần lấy (mặc định: 5)
     * 
     * Authentication: Required (ADMIN, EMPLOYEE, CUSTOMER)
     * 
     * Dùng cho: Trang chi tiết sản phẩm - hiển thị "Sản phẩm tương tự"
     * 
     * Example: GET /api/v1/products/recommendations/1?topN=5
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Lấy danh sách sản phẩm gợi ý thành công",
     *   "data": [
     *     {
     *       "productId": 2,
     *       "name": "Samsung Galaxy S24 Ultra",
     *       "similarity": 0.85,
     *       "imageUrl": "https://example.com/image.jpg",
     *       "price": 24990000,
     *       "category": "Điện thoại",
     *       "brand": "Samsung"
     *     },
     *     ...
     *   ]
     * }
     */
    @GetMapping("/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductRecommendationDTO>>> getRecommendedProducts(
            @PathVariable Integer productId,
            @RequestParam(required = false, defaultValue = "5") Integer topN) {
        
        List<ProductRecommendationDTO> recommendations = 
                recommendationService.getRecommendedProducts(productId, topN);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách sản phẩm gợi ý thành công", 
                recommendations));
    }

    /**
     * Lấy danh sách sản phẩm gợi ý cho trang chủ
     * 
     * Endpoint: GET /api/v1/products/recommendations/home
     * Query Parameters:
     *   - limit: Số lượng sản phẩm cần lấy (mặc định: 10)
     * 
     * Authentication: Required (ADMIN, EMPLOYEE, CUSTOMER)
     * 
     * Dùng cho: Trang chủ - hiển thị "Sản phẩm gợi ý cho bạn"
     * 
     * Example: GET /api/v1/products/recommendations/home?limit=10
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Lấy danh sách sản phẩm gợi ý trang chủ thành công",
     *   "data": [
     *     {
     *       "productId": 1,
     *       "name": "iPhone 15 Pro Max 256GB",
     *       "similarity": 1.0,
     *       "imageUrl": "https://example.com/image.jpg",
     *       "price": 29990000,
     *       "category": "Điện thoại",
     *       "brand": "Apple"
     *     },
     *     ...
     *   ]
     * }
     */
    @GetMapping("/home")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductRecommendationDTO>>> getHomePageRecommendations(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        
        // Lấy customerId từ JWT token (nếu là CUSTOMER)
        Integer customerId = null;
        try {
            Optional<Integer> userId = SecurityUtils.getCurrentUserId();
            if (userId.isPresent()) {
                Optional<Customer> customer = customerRepository.findByUser_IdUser(userId.get());
                if (customer.isPresent()) {
                    customerId = customer.get().getIdCustomer();
                    log.info("Found customer ID: {} for user ID: {}", customerId, userId.get());
                }
            }
        } catch (Exception e) {
            log.warn("Could not get customer ID from token: {}", e.getMessage());
            // Tiếp tục với customerId = null (sẽ dùng best sellers làm seed)
        }
        
        List<ProductRecommendationDTO> recommendations = 
                recommendationService.getHomePageRecommendations(customerId, limit);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách sản phẩm gợi ý trang chủ thành công", 
                recommendations));
    }
}

