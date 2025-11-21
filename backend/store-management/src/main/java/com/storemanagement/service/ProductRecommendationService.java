package com.storemanagement.service;

import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.dto.product.ProductRecommendationResponseDTO;

import java.util.List;

public interface ProductRecommendationService {
    List<ProductDTO> recommendForUser(Long userId);
    ProductRecommendationResponseDTO recommendForUserWithMetadata(Long userId);
    List<ProductDTO> similarProducts(Long productId);
}

