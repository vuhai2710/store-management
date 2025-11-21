package com.storemanagement.controller;

import com.storemanagement.repository.CartRepository;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.repository.OrderRepository;
import com.storemanagement.repository.ProductViewRepository;
import com.storemanagement.service.RecommenderClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final RecommenderClient recommenderClient;
    private final ProductViewRepository productViewRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    @GetMapping("/python-service")
    public ResponseEntity<Map<String, Object>> testPythonService(@RequestParam(required = false) Long userId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (userId != null) {
                var recommendations = recommenderClient.getUserRecommendations(userId);
                result.put("status", "success");
                result.put("userId", userId);
                result.put("recommendations", recommendations);
                result.put("count", recommendations.size());
            } else {
                result.put("status", "error");
                result.put("message", "Please provide userId parameter");
            }
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
            result.put("error", e.getClass().getSimpleName());
            log.error("Error testing Python service", e);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/most-viewed")
    public ResponseEntity<Map<String, Object>> testMostViewed(@RequestParam Integer userId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Lấy customerId
            Integer customerId = customerRepository.findByUser_IdUser(userId)
                    .map(c -> c.getIdCustomer())
                    .orElse(null);
            
            // Lấy excluded products
            List<Integer> purchased = customerId != null ? 
                    orderRepository.findPurchasedProductIdsByCustomerId(customerId) : List.of();
            List<Integer> inCart = customerId != null ? 
                    cartRepository.findProductIdsInCartByCustomerId(customerId) : List.of();
            
            // Lấy top most viewed (lấy nhiều để test)
            List<Object[]> topViewed = productViewRepository.findTopMostViewedProductsByUserNative(userId, 20);
            
            // Filter excluded products
            List<Map<String, Object>> topViewedFiltered = new ArrayList<>();
            List<Map<String, Object>> topViewedExcluded = new ArrayList<>();
            
            for (Object[] row : topViewed) {
                Integer productId = ((Number) row[0]).intValue();
                Long viewCount = ((Number) row[1]).longValue();
                
                Map<String, Object> item = Map.of(
                    "productId", productId,
                    "viewCount", viewCount,
                    "excluded", purchased.contains(productId) || inCart.contains(productId)
                );
                
                if (purchased.contains(productId) || inCart.contains(productId)) {
                    topViewedExcluded.add(item);
                } else {
                    topViewedFiltered.add(item);
                }
            }
            
            result.put("status", "success");
            result.put("userId", userId);
            result.put("customerId", customerId);
            result.put("purchasedProducts", purchased);
            result.put("productsInCart", inCart);
            result.put("top4MostViewed", topViewedFiltered.stream().limit(4).toList());
            result.put("topViewedFiltered", topViewedFiltered);
            result.put("topViewedExcluded", topViewedExcluded);
            result.put("topViewedRaw", topViewed.stream()
                    .map(r -> Map.of("productId", ((Number) r[0]).intValue(), 
                                     "viewCount", ((Number) r[1]).longValue()))
                    .toList());
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
            log.error("Error testing most viewed", e);
        }
        
        return ResponseEntity.ok(result);
    }
}

