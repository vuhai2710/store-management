package com.storemanagement.repository;

import com.storemanagement.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    // Tìm theo productCode (chính xác)
    Optional<Product> findByProductCode(String productCode);

    // Tìm theo SKU (chính xác)
    Optional<Product> findBySku(String sku);

    // Tìm theo name (gần đúng, không phân biệt hoa thường)
    Page<Product> findByProductNameContainingIgnoreCase(String productName, Pageable pageable);

    // Lọc theo category
    Page<Product> findByCategory_IdCategory(Integer idCategory, Pageable pageable);

    // Lọc theo brand (thương hiệu)
    Page<Product> findByBrandIgnoreCase(String brand, Pageable pageable);
    
    // Lọc theo supplier (nhà cung cấp) - nếu cần
    Page<Product> findBySupplier_IdSupplier(Integer idSupplier, Pageable pageable);

    // Tìm kiếm và lọc kết hợp - ĐÃ THÊM JOIN FETCH để tránh N+1 query
    @Query("""
            SELECT DISTINCT p FROM Product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.supplier
            WHERE (:productCode IS NULL OR p.productCode = :productCode)
            AND (:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :productName, '%')))
            AND (:idCategory IS NULL OR p.category.idCategory = :idCategory)
            AND (:brand IS NULL OR LOWER(p.brand) = LOWER(:brand))
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            """)
    Page<Product> searchProducts(
            @Param("productCode") String productCode,
            @Param("productName") String productName,
            @Param("idCategory") Integer idCategory,
            @Param("brand") String brand,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable
    );
    
    // Lấy danh sách product IDs của sản phẩm bán chạy (best sellers)
    // Tính từ order_details, sort theo tổng số lượng đã bán
    @Query(value = """
            SELECT od.id_product, SUM(od.quantity) as total_sold
            FROM order_details od
            INNER JOIN orders o ON od.id_order = o.id_order
            WHERE (:status IS NULL OR o.status = :status)
            GROUP BY od.id_product
            ORDER BY total_sold DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Object[]> findBestSellingProductIds(
            @Param("status") String status,
            @Param("limit") int limit,
            @Param("offset") int offset
    );
    
    // Count tổng số sản phẩm đã bán
    @Query(value = """
            SELECT COUNT(DISTINCT od.id_product)
            FROM order_details od
            INNER JOIN orders o ON od.id_order = o.id_order
            WHERE (:status IS NULL OR o.status = :status)
            """, nativeQuery = true)
    Long countBestSellingProducts(@Param("status") String status);
    
    // Lấy danh sách brands unique (chỉ sản phẩm có status = IN_STOCK)
    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.status = 'IN_STOCK' AND p.brand IS NOT NULL ORDER BY p.brand")
    List<String> findDistinctBrandsByStatus();
    
    // Lấy sản phẩm liên quan: cùng category, khác productId, status = IN_STOCK
    @Query("""
            SELECT p FROM Product p
            WHERE p.category.idCategory = :categoryId
            AND p.idProduct != :productId
            AND p.status = 'IN_STOCK'
            ORDER BY p.createdAt DESC
            """)
    List<Product> findByCategoryIdAndStatusAndIdProductNot(
            @Param("categoryId") Integer categoryId,
            @Param("productId") Integer productId,
            Pageable pageable
    );
    
    // Lấy sản phẩm mới: status = IN_STOCK, sắp xếp theo createdAt DESC
    @Query("""
            SELECT p FROM Product p
            WHERE p.status = 'IN_STOCK'
            ORDER BY p.createdAt DESC
            """)
    Page<Product> findNewProductsByStatus(Pageable pageable);
}

