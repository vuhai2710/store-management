package com.storemanagement.service.impl;

import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.dto.product.ProductRecommendationResponseDTO;
import com.storemanagement.model.Customer;
import com.storemanagement.repository.CartRepository;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.repository.ProductViewRepository;
import com.storemanagement.service.ProductRecommendationService;
import com.storemanagement.service.ProductService;
import com.storemanagement.service.RecommenderClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductRecommendationServiceImpl implements ProductRecommendationService {

    private final RecommenderClient recommenderClient;
    private final ProductService productService;
    private final ProductViewRepository productViewRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> recommendForUser(Long userId) {
        log.info("Getting recommendations for userId: {}", userId);

        Integer customerId = null;
        if (userId != null) {
            Optional<Customer> customerOpt = customerRepository.findByUser_IdUser(userId.intValue());
            if (customerOpt.isPresent()) {
                customerId = customerOpt.get().getIdCustomer();
                log.info("Found customerId: {} for userId: {}", customerId, userId);
            } else {
                log.warn("No customer found for userId: {}", userId);
            }
        }

        Set<Integer> excludedProductIds = new HashSet<>();
        if (customerId != null) {

            List<Integer> purchasedProductIds = orderRepository.findPurchasedProductIdsByCustomerId(customerId);
            excludedProductIds.addAll(purchasedProductIds);
            log.info("Found {} purchased products for customerId {}: {}",
                    purchasedProductIds.size(), customerId, purchasedProductIds);

            List<Integer> cartProductIds = cartRepository.findProductIdsInCartByCustomerId(customerId);
            excludedProductIds.addAll(cartProductIds);
            log.info("Found {} products in cart for customerId {}: {}",
                    cartProductIds.size(), customerId, cartProductIds);
        }
        log.info("Total excluded product IDs: {}", excludedProductIds);

        Integer userIdInt = userId != null ? userId.intValue() : null;
        List<Integer> mostViewedProductIds = getTopMostViewedProducts(userIdInt, 4, excludedProductIds);
        System.out.println("========================================");
        System.out.println("=== MOST VIEWED PRODUCTS (FROM DB) ===");
        System.out.println("UserId: " + userId);
        System.out.println("Excluded (purchased/in cart): " + excludedProductIds);
        System.out.println("Top 4 most viewed: " + mostViewedProductIds);
        System.out.println("========================================");
        log.info("=== MOST VIEWED PRODUCTS (FROM DATABASE) ===");
        log.info("Found {} most viewed products for userId {} (after filtering): {}",
                mostViewedProductIds.size(), userId, mostViewedProductIds);
        log.info("Excluded product IDs (purchased/in cart): {}", excludedProductIds);

        log.info("=== PYTHON SERVICE RECOMMENDATIONS ===");
        List<Long> recommendedIds = recommenderClient.getUserRecommendations(userId);
        log.info("Python service returned {} recommendations: {}", recommendedIds.size(), recommendedIds);
        List<Integer> recommendedProductIds = recommendedIds.stream()
                .map(Long::intValue)
                .filter(id -> !excludedProductIds.contains(id))
                .filter(id -> !mostViewedProductIds.contains(id))
                .limit(8)
                .toList();
        log.info("After filtering (exclude purchased/in cart/duplicates): {} products: {}",
                recommendedProductIds.size(), recommendedProductIds);

        List<Integer> finalProductIds = new ArrayList<>();
        finalProductIds.addAll(mostViewedProductIds);
        finalProductIds.addAll(recommendedProductIds);

        if (finalProductIds.size() < 12) {
            log.info("Not enough products ({}), adding best-selling products as fallback", finalProductIds.size());
            List<ProductDTO> bestSellingProducts = productService.getTop5BestSellingProducts(null);

            final Set<Integer> finalProductIdsSet = new HashSet<>(finalProductIds);
            List<Integer> bestSellingProductIds = bestSellingProducts.stream()
                    .map(ProductDTO::getIdProduct)
                    .filter(id -> !excludedProductIds.contains(id))
                    .filter(id -> !finalProductIdsSet.contains(id))
                    .limit(12 - finalProductIds.size())
                    .toList();
            finalProductIds.addAll(bestSellingProductIds);
        }

        if (finalProductIds.size() > 12) {
            finalProductIds = finalProductIds.subList(0, 12);
        }

        System.out.println("========================================");
        System.out.println("=== FINAL RECOMMENDATION RESULT ===");
        System.out.println("Total: " + finalProductIds.size() + " products");
        System.out.println("Top 4 most viewed (from DB): " + mostViewedProductIds);
        System.out.println("6 recommended (from Python): " + recommendedProductIds);
        System.out.println("Final list (in order): " + finalProductIds);
        System.out.println("========================================");
        log.info("=== FINAL RECOMMENDATION RESULT ===");
        log.info("Total: {} products ({} most viewed from DB + {} recommended from Python)",
                finalProductIds.size(), mostViewedProductIds.size(), recommendedProductIds.size());
        log.info("Most viewed product IDs (4 đầu tiên): {}", mostViewedProductIds);
        log.info("Recommended product IDs from Python (6 sau): {}", recommendedProductIds);
        log.info("Final product IDs (in order): {}", finalProductIds);

        List<Long> finalProductIdsLong = finalProductIds.stream()
                .map(Integer::longValue)
                .toList();

        List<ProductDTO> result = productService.getProductsByIds(finalProductIdsLong);
        log.info("Returning {} product DTOs", result.size());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductRecommendationResponseDTO recommendForUserWithMetadata(Long userId) {
        log.info("Getting recommendations with metadata for userId: {}", userId);

        Integer customerId = null;
        if (userId != null) {
            Optional<Customer> customerOpt = customerRepository.findByUser_IdUser(userId.intValue());
            if (customerOpt.isPresent()) {
                customerId = customerOpt.get().getIdCustomer();
                log.info("Found customerId: {} for userId: {}", customerId, userId);
            } else {
                log.warn("No customer found for userId: {}", userId);
            }
        }

        Set<Integer> excludedProductIds = new HashSet<>();
        if (customerId != null) {
            List<Integer> purchasedProductIds = orderRepository.findPurchasedProductIdsByCustomerId(customerId);
            excludedProductIds.addAll(purchasedProductIds);
            List<Integer> cartProductIds = cartRepository.findProductIdsInCartByCustomerId(customerId);
            excludedProductIds.addAll(cartProductIds);
        }

        Integer userIdInt = userId != null ? userId.intValue() : null;
        List<Integer> mostViewedProductIds = getTopMostViewedProducts(userIdInt, 4, excludedProductIds);

        List<Long> recommendedIds = recommenderClient.getUserRecommendations(userId);
        List<Integer> recommendedProductIds = recommendedIds.stream()
                .map(Long::intValue)
                .filter(id -> !excludedProductIds.contains(id))
                .filter(id -> !mostViewedProductIds.contains(id))
                .limit(8)
                .toList();

        List<Long> mostViewedIdsLong = mostViewedProductIds.stream()
                .map(Integer::longValue)
                .toList();
        List<ProductDTO> mostViewedProducts = productService.getProductsByIds(mostViewedIdsLong);

        List<Long> recommendedIdsLong = recommendedProductIds.stream()
                .map(Integer::longValue)
                .toList();
        List<ProductDTO> recommendedProducts = productService.getProductsByIds(recommendedIdsLong);

        List<ProductDTO> allProducts = new ArrayList<>();
        allProducts.addAll(mostViewedProducts);
        allProducts.addAll(recommendedProducts);

        return ProductRecommendationResponseDTO.builder()
                .mostViewedProducts(mostViewedProducts)
                .recommendedProducts(recommendedProducts)
                .allProducts(allProducts)
                .build();
    }

    private List<Integer> getTopMostViewedProducts(Integer userId, int limit, Set<Integer> excludedProductIds) {
        try {
            List<Object[]> results;

            int queryLimit = Math.max(limit * 5, 50);

            if (userId != null) {

                log.info("Getting top {} most viewed products for userId: {} (query limit: {})", limit, userId, queryLimit);
                results = productViewRepository.findTopMostViewedProductsByUserNative(userId, queryLimit);
            } else {

                log.info("No userId provided, getting top {} most viewed products from all users (query limit: {})", limit, queryLimit);
                results = productViewRepository.findTopMostViewedProductsNative(queryLimit);
            }

            List<Integer> productIds = new ArrayList<>();
            System.out.println("[getTopMostViewedProducts] Processing " + results.size() + " results from DB");
            log.info("Processing {} results from database query", results.size());

            if (results.isEmpty()) {
                System.out.println("[getTopMostViewedProducts] No results from database!");
                log.warn("No results from database query for userId: {}", userId);
                return productIds;
            }

            for (Object[] result : results) {
                Integer productId = ((Number) result[0]).intValue();
                Long viewCount = ((Number) result[1]).longValue();

                if (!excludedProductIds.contains(productId)) {
                    productIds.add(productId);
                    System.out.println("[getTopMostViewedProducts] ✓ Added product " + productId + " (views: " + viewCount + ")");
                    log.info("Added product {} to most viewed list (view count: {})", productId, viewCount);
                    if (productIds.size() >= limit) {
                        break;
                    }
                } else {
                    System.out.println("[getTopMostViewedProducts] ✗ Excluded product " + productId + " (views: " + viewCount + ", reason: purchased/in cart)");
                    log.info("Excluded product {} from most viewed list (view count: {}, reason: already purchased or in cart)",
                            productId, viewCount);
                }
            }

            log.info("Returning {} most viewed products after filtering (requested: {}): {}",
                    productIds.size(), limit, productIds);

            if (productIds.size() < limit) {
                log.warn("Only found {} most viewed products (requested {}). Excluded products may be too many.",
                        productIds.size(), limit);
            }

            return productIds;
        } catch (Exception e) {
            log.error("Error getting most viewed products for userId {}: {}", userId, e.getMessage(), e);
            return new ArrayList<>();
        }
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

