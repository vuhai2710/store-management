package com.storemanagement.repository;

import com.storemanagement.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {

    List<ProductImage> findByProduct_IdProductOrderByDisplayOrderAsc(Integer productId);

    long countByProduct_IdProduct(Integer productId);

    Optional<ProductImage> findByProduct_IdProductAndIsPrimaryTrue(Integer productId);

    @Query("SELECT pi FROM ProductImage pi WHERE pi.product.idProduct = :productId ORDER BY pi.displayOrder ASC LIMIT 1")
    Optional<ProductImage> findFirstByProductId(@Param("productId") Integer productId);

    void deleteByProduct_IdProduct(Integer productId);
}
