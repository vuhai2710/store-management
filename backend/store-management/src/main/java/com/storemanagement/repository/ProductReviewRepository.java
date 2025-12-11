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
    Page<ProductReview> findByProductIdProductOrderByCreatedAtDesc(Integer productId, Pageable pageable);
    
    Page<ProductReview> findByProductIdProductAndRatingOrderByCreatedAtDesc(Integer productId, Integer rating, Pageable pageable);

    Page<ProductReview> findByCustomerIdCustomerOrderByCreatedAtDesc(Integer customerId, Pageable pageable);

    Optional<ProductReview> findByOrderDetailIdOrderDetail(Integer orderDetailId);

    Optional<ProductReview> findByIdReviewAndCustomerIdCustomer(Integer reviewId, Integer customerId);

    @Query("SELECT r FROM ProductReview r ORDER BY r.createdAt DESC")
    Page<ProductReview> findAllReviewsOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT r FROM ProductReview r " +
           "LEFT JOIN FETCH r.customer " +
           "LEFT JOIN FETCH r.order " +
           "LEFT JOIN FETCH r.orderDetail " +
           "WHERE r.product.idProduct = :productId " +
           "ORDER BY r.createdAt DESC")
    List<ProductReview> findByProductIdProductWithDetails(@Param("productId") Integer productId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM ProductReview r WHERE r.product.idProduct = :productId")
    Double getAverageRatingByProductId(@Param("productId") Integer productId);

    long countByProductIdProduct(Integer productId);
}


