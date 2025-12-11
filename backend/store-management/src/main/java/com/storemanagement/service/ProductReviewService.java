package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.review.CreateReviewRequestDTO;
import com.storemanagement.dto.review.ProductReviewDTO;
import com.storemanagement.dto.review.UpdateReviewRequestDTO;
import org.springframework.data.domain.Pageable;

public interface ProductReviewService {
    ProductReviewDTO createReview(Integer customerId, Integer productId, CreateReviewRequestDTO request);

    PageResponse<ProductReviewDTO> getProductReviews(Integer productId, Pageable pageable);

    PageResponse<ProductReviewDTO> getMyReviews(Integer customerId, Pageable pageable);

    ProductReviewDTO updateReview(Integer customerId, Integer reviewId, UpdateReviewRequestDTO request);

    void deleteReview(Integer customerId, Integer reviewId);

    PageResponse<ProductReviewDTO> getAllReviews(Pageable pageable);

    ProductReviewDTO getReviewById(Integer reviewId);

    void deleteReviewByAdmin(Integer reviewId);

    ProductReviewDTO replyToReview(Integer reviewId, String adminReply);

    PageResponse<ProductReviewDTO> getProductReviewsByRating(Integer productId, Integer rating, Pageable pageable);
}


