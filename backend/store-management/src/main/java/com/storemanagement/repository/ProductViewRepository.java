package com.storemanagement.repository;

import com.storemanagement.model.ProductView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductViewRepository extends JpaRepository<ProductView, Long> {
    List<ProductView> findTop200ByUserIdOrderByCreatedAtDesc(Integer userId);

    @Query(value = "SELECT product_id, COUNT(*) as view_count " +
           "FROM product_view " +
           "WHERE user_id = :userId " +
           "GROUP BY product_id " +
           "ORDER BY view_count DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopMostViewedProductsByUserNative(@Param("userId") Integer userId, @Param("limit") int limit);

    @Query(value = "SELECT product_id, COUNT(*) as view_count " +
           "FROM product_view " +
           "GROUP BY product_id " +
           "ORDER BY view_count DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopMostViewedProductsNative(@Param("limit") int limit);
}

