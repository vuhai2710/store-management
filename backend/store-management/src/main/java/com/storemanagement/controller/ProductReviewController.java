package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.review.CreateReviewRequestDTO;
import com.storemanagement.dto.review.ProductReviewDTO;
import com.storemanagement.dto.review.UpdateReviewRequestDTO;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.ProductReviewService;
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

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProductReviewController {

    private final ProductReviewService productReviewService;
    private final CustomerService customerService;

    /**
     * Customer: Tạo đánh giá sản phẩm
     *
     * Endpoint: POST /api/v1/products/{productId}/reviews
     * Authentication: Required (CUSTOMER role)
     *
     * Request body:
     * {
     *   "orderDetailId": 1,
     *   "rating": 5,
     *   "comment": "Sản phẩm tốt"
     * }
     */
    @PostMapping("/products/{productId}/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProductReviewDTO>> createReview(
            @PathVariable Integer productId,
            @RequestBody @Valid CreateReviewRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        ProductReviewDTO review = productReviewService.createReview(customerId, productId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo đánh giá thành công", review));
    }

    /**
     * Customer/Admin/Employee: Lấy danh sách đánh giá của sản phẩm
     *
     * Endpoint: GET /api/v1/products/{productId}/reviews
     * Authentication: Required (CUSTOMER, ADMIN, EMPLOYEE)
     */
    @GetMapping("/products/{productId}/reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductReviewDTO>>> getProductReviews(
            @PathVariable Integer productId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductReviewDTO> reviews = productReviewService.getProductReviews(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công", reviews));
    }

    /**
     * Customer: Lấy danh sách đánh giá của customer hiện tại
     *
     * Endpoint: GET /api/v1/reviews/my-reviews
     * Authentication: Required (CUSTOMER role)
     */
    @GetMapping("/reviews/my-reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductReviewDTO>>> getMyReviews(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductReviewDTO> reviews = productReviewService.getMyReviews(customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công", reviews));
    }

    /**
     * Customer: Chỉnh sửa đánh giá (trong 24h)
     *
     * Endpoint: PUT /api/v1/reviews/{reviewId}
     * Authentication: Required (CUSTOMER role)
     */
    @PutMapping("/reviews/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProductReviewDTO>> updateReview(
            @PathVariable Integer reviewId,
            @RequestBody @Valid UpdateReviewRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        ProductReviewDTO review = productReviewService.updateReview(customerId, reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đánh giá thành công", review));
    }

    /**
     * Customer: Xóa đánh giá (trong 24h)
     *
     * Endpoint: DELETE /api/v1/reviews/{reviewId}
     * Authentication: Required (CUSTOMER role)
     */
    @DeleteMapping("/reviews/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Integer reviewId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Integer customerId = customerService.getCustomerByUsername(username).getIdCustomer();

        productReviewService.deleteReview(customerId, reviewId);
        return ResponseEntity.ok(ApiResponse.success("Xóa đánh giá thành công", null));
    }

    /**
     * Admin/Employee: Xem tất cả đánh giá
     *
     * Endpoint: GET /api/v1/admin/reviews
     * Authentication: Required (ADMIN, EMPLOYEE)
     */
    @GetMapping("/admin/reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductReviewDTO>>> getAllReviews(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductReviewDTO> reviews = productReviewService.getAllReviews(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công", reviews));
    }

    /**
     * Admin/Employee: Xem chi tiết đánh giá
     *
     * Endpoint: GET /api/v1/admin/reviews/{reviewId}
     * Authentication: Required (ADMIN, EMPLOYEE)
     */
    @GetMapping("/admin/reviews/{reviewId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductReviewDTO>> getReviewById(@PathVariable Integer reviewId) {
        ProductReviewDTO review = productReviewService.getReviewById(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đánh giá thành công", review));
    }

    /**
     * Admin/Employee: Xóa đánh giá (bất kỳ lúc nào)
     *
     * Endpoint: DELETE /api/v1/admin/reviews/{reviewId}
     * Authentication: Required (ADMIN, EMPLOYEE)
     */
    @DeleteMapping("/admin/reviews/{reviewId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> deleteReviewByAdmin(@PathVariable Integer reviewId) {
        productReviewService.deleteReviewByAdmin(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Xóa đánh giá thành công", null));
    }
}


