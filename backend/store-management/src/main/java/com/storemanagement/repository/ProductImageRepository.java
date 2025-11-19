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
    
    /**
     * Lấy tất cả ảnh của sản phẩm, sắp xếp theo display_order
     */
    List<ProductImage> findByProduct_IdProductOrderByDisplayOrderAsc(Integer productId);
    
    /**
     * Đếm số lượng ảnh của sản phẩm
     */
    long countByProduct_IdProduct(Integer productId);
    
    /**
     * Lấy ảnh chính của sản phẩm
     */
    Optional<ProductImage> findByProduct_IdProductAndIsPrimaryTrue(Integer productId);
    
    /**
     * Lấy ảnh có display_order nhỏ nhất (ảnh đầu tiên) của sản phẩm
     */
    @Query("SELECT pi FROM ProductImage pi WHERE pi.product.idProduct = :productId ORDER BY pi.displayOrder ASC LIMIT 1")
    Optional<ProductImage> findFirstByProductId(@Param("productId") Integer productId);
    
    /**
     * Xóa tất cả ảnh của sản phẩm (cascade sẽ xử lý, nhưng giữ method này cho explicit control)
     */
    void deleteByProduct_IdProduct(Integer productId);
}

























