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

        List<Product> findByIdProductInAndIsDeleteFalse(List<Integer> ids);

        List<Product> findByIdProductIn(List<Integer> ids);

        List<Product> findAllByIsDeleteFalse();

        Optional<Product> findByProductCodeAndIsDeleteFalse(String productCode);

        Optional<Product> findBySkuAndIsDeleteFalse(String sku);

        Optional<Product> findByProductCode(String productCode);

        Optional<Product> findBySku(String sku);

        Page<Product> findByProductNameContainingIgnoreCaseAndIsDeleteFalse(String productName, Pageable pageable);

        Page<Product> findByProductNameContainingIgnoreCase(String productName, Pageable pageable);

        Page<Product> findByCategory_IdCategoryAndIsDeleteFalse(Integer idCategory, Pageable pageable);

        Page<Product> findByCategory_IdCategoryAndIdProductNot(Integer idCategory, Integer idProduct,
                        Pageable pageable);

        Page<Product> findByBrandIgnoreCaseAndIsDeleteFalse(String brand, Pageable pageable);

        Page<Product> findByBrandIgnoreCase(String brand, Pageable pageable);

        Page<Product> findBySupplier_IdSupplierAndIsDeleteFalse(Integer idSupplier, Pageable pageable);

        Optional<Product> findByIdProductAndIsDeleteTrue(Integer idProduct);

        @Query("""
                        SELECT DISTINCT p FROM Product p
                        LEFT JOIN FETCH p.category
                        LEFT JOIN FETCH p.supplier
                        WHERE (
                            :keyword IS NULL OR
                            LOWER(p.productCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                            LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                            LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        )
                        AND (:idCategory IS NULL OR p.category.idCategory = :idCategory)
                        AND (:idSupplier IS NULL OR p.supplier.idSupplier = :idSupplier)
                        AND (:brand IS NULL OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
                        AND (:minPrice IS NULL OR p.price >= :minPrice)
                        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
                        AND (
                            :inventoryStatus IS NULL OR
                            (:inventoryStatus = 'COMING_SOON' AND (p.stockQuantity = 0 OR p.stockQuantity IS NULL) AND p.status != 'DISCONTINUED') OR
                            (:inventoryStatus = 'IN_STOCK' AND p.stockQuantity >= 10) OR
                            (:inventoryStatus = 'LOW_STOCK' AND p.stockQuantity > 0 AND p.stockQuantity < 10) OR
                            (:inventoryStatus = 'OUT_OF_STOCK' AND (p.stockQuantity = 0 OR p.stockQuantity IS NULL) AND p.status = 'OUT_OF_STOCK')
                        )
                        AND (p.isDelete = :showDeleted)
                        """)
        Page<Product> searchProducts(@Param("keyword") String keyword, @Param("idCategory") Integer idCategory,
                        @Param("idSupplier") Integer idSupplier, @Param("brand") String brand,
                        @Param("minPrice") Double minPrice,
                        @Param("maxPrice") Double maxPrice, @Param("inventoryStatus") String inventoryStatus,
                        @Param("showDeleted") Boolean showDeleted, Pageable pageable);

        @Query(value = """
                        SELECT od.id_product, SUM(od.quantity) as total_sold
                        FROM order_details od
                        INNER JOIN orders o ON od.id_order = o.id_order
                        INNER JOIN products p ON od.id_product = p.id_product
                        WHERE (:status IS NULL OR o.status = :status)
                        AND p.is_delete = 0
                        GROUP BY od.id_product
                        ORDER BY total_sold DESC
                        LIMIT :limit OFFSET :offset
                        """, nativeQuery = true)
        List<Object[]> findBestSellingProductIds(@Param("status") String status, @Param("limit") int limit,
                        @Param("offset") int offset);

        @Query(value = """
                        SELECT COUNT(DISTINCT od.id_product)
                        FROM order_details od
                        INNER JOIN orders o ON od.id_order = o.id_order
                        INNER JOIN products p ON od.id_product = p.id_product
                        WHERE (:status IS NULL OR o.status = :status)
                        AND p.is_delete = 0
                        """, nativeQuery = true)
        Long countBestSellingProducts(@Param("status") String status);

        @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.status = 'IN_STOCK' AND p.brand IS NOT NULL AND p.isDelete = false ORDER BY p.brand")
        List<String> findDistinctBrandsByStatus();

        @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.brand IS NOT NULL ORDER BY p.brand")
        List<String> findDistinctBrands();

        @Query("""
                        SELECT p FROM Product p
                        WHERE p.category.idCategory = :categoryId
                        AND p.idProduct != :productId
                        AND p.status = 'IN_STOCK'
                        AND p.isDelete = false
                        ORDER BY p.createdAt DESC
                        """)
        List<Product> findByCategoryIdAndStatusAndIdProductNot(@Param("categoryId") Integer categoryId,
                        @Param("productId") Integer productId, Pageable pageable);

        @Query("""
                        SELECT p FROM Product p
                        WHERE p.status = 'IN_STOCK'
                        AND p.isDelete = false
                        ORDER BY p.createdAt DESC
                        """)
        Page<Product> findNewProductsByStatus(Pageable pageable);

        @Query("""
                        SELECT p FROM Product p
                        LEFT JOIN FETCH p.category
                        LEFT JOIN FETCH p.supplier
                        WHERE p.idProduct = :id
                        AND p.isDelete = false
                        """)
        Optional<Product> findByIdWithDetails(@Param("id") Integer id);

        @Query("""
                        SELECT p FROM Product p
                        LEFT JOIN FETCH p.category
                        LEFT JOIN FETCH p.supplier
                        WHERE p.idProduct = :id
                        """)
        Optional<Product> findByIdWithDetailsIncludeDeleted(@Param("id") Integer id);
}
