package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.service.ProductRecommendationService;
import com.storemanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductRecommendationController {

    private final ProductRecommendationService productRecommendationService;

    @GetMapping("/recommend")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getRecommendations() {
        Long userId = SecurityUtils.getCurrentUserId()
                .map(Integer::longValue)
                .orElse(null);
        
        if (userId == null) {
            return ResponseEntity.ok(ApiResponse.success("Không tìm thấy thông tin người dùng", List.of()));
        }
        
        System.out.println("[ProductRecommendationController] Getting recommendations for userId: " + userId);
        List<ProductDTO> recommendations = productRecommendationService.recommendForUser(userId);
        System.out.println("[ProductRecommendationController] Found " + recommendations.size() + " recommendations");
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách gợi ý sản phẩm thành công", recommendations));
    }

    @GetMapping("/{id}/similar")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getSimilarProducts(@PathVariable Integer id) {
        List<ProductDTO> similarProducts = productRecommendationService.similarProducts(id.longValue());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm tương tự thành công", similarProducts));
    }
}

