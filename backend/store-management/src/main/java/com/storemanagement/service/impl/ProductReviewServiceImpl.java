package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.review.CreateReviewRequestDTO;
import com.storemanagement.dto.review.ProductReviewDTO;
import com.storemanagement.dto.review.UpdateReviewRequestDTO;
import com.storemanagement.mapper.ProductReviewMapper;
import com.storemanagement.model.*;
import com.storemanagement.repository.*;
import com.storemanagement.service.ProductReviewService;
import com.storemanagement.service.SystemSettingService;
import com.storemanagement.utils.PageUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductReviewMapper productReviewMapper;
    private final SystemSettingService systemSettingService;

    @Override
    public ProductReviewDTO createReview(Integer customerId, Integer productId, CreateReviewRequestDTO request) {
        log.info("Creating review for product ID: {} by customer ID: {}", productId, customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm"));

        OrderDetail orderDetail = orderDetailRepository.findById(request.getOrderDetailId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chi tiết đơn hàng"));

        Order order = orderDetail.getOrder();
        if (order.getCustomer() == null || !order.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Chi tiết đơn hàng không thuộc về khách hàng này");
        }

        if (!orderDetail.getProduct().getIdProduct().equals(productId)) {
            throw new RuntimeException("Chi tiết đơn hàng không thuộc về sản phẩm này");
        }

        if (order.getStatus() != Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Chỉ có thể đánh giá sản phẩm từ đơn hàng đã hoàn thành");
        }

        if (productReviewRepository.findByOrderDetailIdOrderDetail(request.getOrderDetailId()).isPresent()) {
            throw new RuntimeException("Đơn hàng này đã được đánh giá");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5");
        }

        if (request.getComment() == null || request.getComment().trim().isEmpty()) {
            throw new RuntimeException("Comment không được để trống");
        }

        ProductReview review = ProductReview.builder()
                .product(product)
                .customer(customer)
                .order(order)
                .orderDetail(orderDetail)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .build();

        review = productReviewRepository.save(review);
        log.info("Review created successfully with ID: {}", review.getIdReview());

        return productReviewMapper.toDTO(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductReviewDTO> getProductReviews(Integer productId, Pageable pageable) {
        log.info("Getting reviews for product ID: {}", productId);

        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm");
        }

        Page<ProductReview> reviews = productReviewRepository.findByProductIdProductOrderByCreatedAtDesc(productId, pageable);
        return PageUtils.toPageResponse(reviews.map(productReviewMapper::toDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductReviewDTO> getMyReviews(Integer customerId, Pageable pageable) {
        log.info("Getting reviews for customer ID: {}", customerId);

        if (!customerRepository.existsById(customerId)) {
            throw new EntityNotFoundException("Không tìm thấy khách hàng");
        }

        Page<ProductReview> reviews = productReviewRepository.findByCustomerIdCustomerOrderByCreatedAtDesc(customerId, pageable);
        return PageUtils.toPageResponse(reviews.map(productReviewMapper::toDTO));
    }

    @Override
    public ProductReviewDTO updateReview(Integer customerId, Integer reviewId, UpdateReviewRequestDTO request) {
        log.info("Updating review ID: {} by customer ID: {}", reviewId, customerId);

        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đánh giá"));

        if (!review.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Không có quyền chỉnh sửa đánh giá này");
        }

        int reviewEditWindowHours = systemSettingService.getReviewEditWindowHours();

        LocalDateTime createdAt = review.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();
        long hoursSinceCreation = ChronoUnit.HOURS.between(createdAt, now);

        if (hoursSinceCreation >= reviewEditWindowHours) {
            throw new RuntimeException("Chỉ có thể chỉnh sửa đánh giá trong vòng " + reviewEditWindowHours + " giờ sau khi tạo");
        }

        if (review.getEditCount() >= 1) {
            throw new RuntimeException("Chỉ được phép chỉnh sửa đánh giá 1 lần");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5");
        }

        if (request.getComment() == null || request.getComment().trim().isEmpty()) {
            throw new RuntimeException("Comment không được để trống");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        review.setEditCount(review.getEditCount() + 1);
        review = productReviewRepository.save(review);

        log.info("Review updated successfully with ID: {}", review.getIdReview());
        return productReviewMapper.toDTO(review);
    }

    @Override
    public void deleteReview(Integer customerId, Integer reviewId) {
        log.info("Deleting review ID: {} by customer ID: {}", reviewId, customerId);

        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đánh giá"));

        if (!review.getCustomer().getIdCustomer().equals(customerId)) {
            throw new RuntimeException("Không có quyền xóa đánh giá này");
        }

        LocalDateTime createdAt = review.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();
        long hoursSinceCreation = ChronoUnit.HOURS.between(createdAt, now);

        if (hoursSinceCreation >= 24) {
            throw new RuntimeException("Chỉ có thể xóa đánh giá trong vòng 24 giờ sau khi tạo");
        }

        productReviewRepository.delete(review);
        log.info("Review deleted successfully with ID: {}", reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductReviewDTO> getAllReviews(Pageable pageable) {
        log.info("Getting all reviews (admin/employee)");

        Page<ProductReview> reviews = productReviewRepository.findAllReviewsOrderByCreatedAtDesc(pageable);
        return PageUtils.toPageResponse(reviews.map(productReviewMapper::toDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReviewDTO getReviewById(Integer reviewId) {
        log.info("Getting review by ID: {}", reviewId);

        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đánh giá"));

        return productReviewMapper.toDTO(review);
    }

    @Override
    public void deleteReviewByAdmin(Integer reviewId) {
        log.info("Deleting review ID: {} by admin/employee", reviewId);

        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đánh giá"));

        productReviewRepository.delete(review);
        log.info("Review deleted successfully by admin/employee with ID: {}", reviewId);
    }

    @Override
    public ProductReviewDTO replyToReview(Integer reviewId, String adminReply) {
        log.info("Admin replying to review ID: {}", reviewId);

        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đánh giá"));

        if (adminReply == null || adminReply.trim().isEmpty()) {
            throw new RuntimeException("Admin reply không được để trống");
        }

        review.setAdminReply(adminReply.trim());
        review = productReviewRepository.save(review);

        log.info("Admin replied to review ID: {}", reviewId);
        return productReviewMapper.toDTO(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductReviewDTO> getProductReviewsByRating(Integer productId, Integer rating, Pageable pageable) {
        log.info("Getting reviews for product ID: {} with rating: {}", productId, rating);

        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm");
        }

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5");
        }

        Page<ProductReview> reviews = productReviewRepository
                .findByProductIdProductAndRatingOrderByCreatedAtDesc(productId, rating, pageable);

        return PageUtils.toPageResponse(reviews.map(productReviewMapper::toDTO));
    }
}

