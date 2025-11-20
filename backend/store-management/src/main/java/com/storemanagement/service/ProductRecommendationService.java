package com.storemanagement.service;

import com.storemanagement.dto.product.ProductDTO;

import java.util.List;

public interface ProductRecommendationService {
    List<ProductDTO> recommendForUser(Long userId);
    List<ProductDTO> similarProducts(Long productId);
}

