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

    Optional<Product> findByProductCode(String productCode);

    Optional<Product> findBySku(String sku);

    Page<Product> findByProductNameContainingIgnoreCase(String productName, Pageable pageable);

    Page<Product> findByCategory_IdCategory(Integer idCategory, Pageable pageable);

    Page<Product> findByBrandIgnoreCase(String brand, Pageable pageable);

    Page<Product> findBySupplier_IdSupplier(Integer idSupplier, Pageable pageable);

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
            AND (
                :inventoryStatus IS NULL OR
                (:inventoryStatus = 'COMING_SOON' AND (p.stockQuantity = 0 OR p.stockQuantity IS NULL) AND p.status != 'DISCONTINUED') OR
                (:inventoryStatus = 'IN_STOCK' AND p.stockQuantity > 0) OR
                (:inventoryStatus = 'OUT_OF_STOCK' AND (p.stockQuantity = 0 OR p.stockQuantity IS NULL) AND p.status = 'OUT_OF_STOCK')
            )
            """)
    Page<Product> searchProducts(
            @Param("productCode") String productCode,
            @Param("productName") String productName,
            @Param("idCategory") Integer idCategory,
            @Param("brand") String brand,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("inventoryStatus") String inventoryStatus,
            Pageable pageable
    );

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

    @Query(value = """
            SELECT COUNT(DISTINCT od.id_product)
            FROM order_details od
            INNER JOIN orders o ON od.id_order = o.id_order
            WHERE (:status IS NULL OR o.status = :status)
            """, nativeQuery = true)
    Long countBestSellingProducts(@Param("status") String status);

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.status = 'IN_STOCK' AND p.brand IS NOT NULL ORDER BY p.brand")
    List<String> findDistinctBrandsByStatus();

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

    @Query("""
            SELECT p FROM Product p
            WHERE p.status = 'IN_STOCK'
            ORDER BY p.createdAt DESC
            """)
    Page<Product> findNewProductsByStatus(Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.supplier
            WHERE p.idProduct = :id
            """)
    Optional<Product> findByIdWithDetails(@Param("id") Integer id);
}

