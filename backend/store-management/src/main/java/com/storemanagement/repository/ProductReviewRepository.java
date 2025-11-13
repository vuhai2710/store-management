package com.storemanagement.repository;

import com.storemanagement.model.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Integer> {
    // Lấy danh sách đánh giá theo sản phẩm
    Page<ProductReview> findByProductIdProductOrderByCreatedAtDesc(Integer productId, Pageable pageable);

    // Lấy danh sách đánh giá theo customer
    Page<ProductReview> findByCustomerIdCustomerOrderByCreatedAtDesc(Integer customerId, Pageable pageable);

    // Kiểm tra customer đã review order detail chưa
    Optional<ProductReview> findByOrderDetailIdOrderDetail(Integer orderDetailId);

    // Lấy review theo order detail
    Optional<ProductReview> findByIdReviewAndCustomerIdCustomer(Integer reviewId, Integer customerId);

    // Lấy tất cả reviews (admin/employee)
    @Query("SELECT r FROM ProductReview r ORDER BY r.createdAt DESC")
    Page<ProductReview> findAllReviewsOrderByCreatedAtDesc(Pageable pageable);

    // Lấy reviews theo product với customer và order details
    @Query("SELECT r FROM ProductReview r " +
           "LEFT JOIN FETCH r.customer " +
           "LEFT JOIN FETCH r.order " +
           "LEFT JOIN FETCH r.orderDetail " +
           "WHERE r.product.idProduct = :productId " +
           "ORDER BY r.createdAt DESC")
    List<ProductReview> findByProductIdProductWithDetails(@Param("productId") Integer productId);
}


