package com.storemanagement.service.impl;

import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.service.ProductRecommendationService;
import com.storemanagement.service.ProductService;
import com.storemanagement.service.RecommenderClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductRecommendationServiceImpl implements ProductRecommendationService {

    private final RecommenderClient recommenderClient;
    private final ProductService productService;

    @Override
    public List<ProductDTO> recommendForUser(Long userId) {
        log.info("Getting recommendations for userId: {}", userId);
        
        List<Long> recommendedIds = recommenderClient.getUserRecommendations(userId);
        
        if (recommendedIds.isEmpty()) {
            log.warn("No recommendations found for userId: {}. Returning best-selling products as fallback.", userId);
            // Fallback: return best-selling products if user has no view history
            List<ProductDTO> fallbackProducts = productService.getTop5BestSellingProducts(null);
            if (fallbackProducts.size() > 10) {
                return fallbackProducts.subList(0, 10);
            }
            return fallbackProducts;
        }
        
        return productService.getProductsByIds(recommendedIds);
    }

    @Override
    public List<ProductDTO> similarProducts(Long productId) {
        log.info("Getting similar products for productId: {}", productId);
        
        List<Long> similarIds = recommenderClient.getSimilarProducts(productId);
        
        if (similarIds.isEmpty()) {
            log.warn("No similar products found for productId: {}", productId);
            return List.of();
        }
        
        return productService.getProductsByIds(similarIds);
    }
}

