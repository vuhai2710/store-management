package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.review.CreateReviewRequestDTO;
import com.storemanagement.dto.review.ProductReviewDTO;
import com.storemanagement.dto.review.UpdateReviewRequestDTO;
import org.springframework.data.domain.Pageable;

public interface ProductReviewService {
    /**
     * Customer: Tạo đánh giá sản phẩm
     *
     * Validation:
     * - Customer phải đã mua sản phẩm (có order với status = COMPLETED)
     * - Order phải có delivered_at (đã giao hàng thành công)
     * - Mỗi order detail chỉ được review 1 lần
     * - Rating phải từ 1-5
     * - Comment không được rỗng
     */
    ProductReviewDTO createReview(Integer customerId, Integer productId, CreateReviewRequestDTO request);

    /**
     * Customer: Lấy danh sách đánh giá của sản phẩm
     */
    PageResponse<ProductReviewDTO> getProductReviews(Integer productId, Pageable pageable);

    /**
     * Customer: Lấy danh sách đánh giá của customer hiện tại
     */
    PageResponse<ProductReviewDTO> getMyReviews(Integer customerId, Pageable pageable);

    /**
     * Customer: Chỉnh sửa đánh giá (trong 24h)
     *
     * Validation:
     * - Review phải thuộc về customer hiện tại
     * - Created_at + 24h >= current time
     */
    ProductReviewDTO updateReview(Integer customerId, Integer reviewId, UpdateReviewRequestDTO request);

    /**
     * Customer: Xóa đánh giá (trong 24h)
     *
     * Validation:
     * - Review phải thuộc về customer hiện tại
     * - Created_at + 24h >= current time
     */
    void deleteReview(Integer customerId, Integer reviewId);

    /**
     * Admin/Employee: Xem tất cả đánh giá
     */
    PageResponse<ProductReviewDTO> getAllReviews(Pageable pageable);

    /**
     * Admin/Employee: Xem chi tiết đánh giá
     */
    ProductReviewDTO getReviewById(Integer reviewId);

    /**
     * Admin/Employee: Xóa đánh giá (bất kỳ lúc nào)
     */
    void deleteReviewByAdmin(Integer reviewId);
}



