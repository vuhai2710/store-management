package com.storemanagement.repository;

import com.storemanagement.model.ProductView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductViewRepository extends JpaRepository<ProductView, Long> {
    List<ProductView> findTop200ByUserIdOrderByCreatedAtDesc(Integer userId);
}

