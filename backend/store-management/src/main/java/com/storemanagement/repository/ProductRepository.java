package com.storemanagement.repository;

import com.storemanagement.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    // Lọc theo supplier
    Page<Product> findBySupplier_IdSupplier(Integer idSupplier, Pageable pageable);

    // Tìm kiếm và lọc kết hợp
    @Query("""
            SELECT p FROM Product p
            WHERE (:productCode IS NULL OR p.productCode = :productCode)
            AND (:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :productName, '%')))
            AND (:idCategory IS NULL OR p.category.idCategory = :idCategory)
            AND (:idSupplier IS NULL OR p.supplier.idSupplier = :idSupplier)
            """)
    Page<Product> searchProducts(
            @Param("productCode") String productCode,
            @Param("productName") String productName,
            @Param("idCategory") Integer idCategory,
            @Param("idSupplier") Integer idSupplier,
            Pageable pageable
    );
}

