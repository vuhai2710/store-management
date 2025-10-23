package com.storemanagement.repository;

import com.storemanagement.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    
    List<Product> findByProductNameContainingIgnoreCase(String productName);
    
    List<Product> findByCategory_IdCategory(Integer idCategory);
    
    List<Product> findByStatus(String status);
    
    List<Product> findByStockQuantityLessThan(Integer threshold);
    
    @Query("SELECT p FROM Product p WHERE p.productName LIKE %?1% OR p.description LIKE %?1%")
    List<Product> searchProducts(String keyword);
}
