package com.storemanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.storemanagement.config.RecommenderProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class RecommenderClient {

    private final RecommenderProperties recommenderProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public RecommenderClient(RecommenderProperties recommenderProperties,
                            @Qualifier("recommenderRestTemplate") RestTemplate restTemplate,
                            ObjectMapper objectMapper) {
        this.recommenderProperties = recommenderProperties;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public List<Long> getUserRecommendations(Long userId) {
        String url = recommenderProperties.getBaseUrl() + "/recommend?userId=" + userId;
        log.info("Calling Python recommender service: {}", url);

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            log.info("Python service response status: {}, body: {}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                JsonNode recommendationsNode = jsonNode.get("recommendations");

                if (recommendationsNode != null && recommendationsNode.isArray()) {
                    List<Long> recommendations = new ArrayList<>();
                    for (JsonNode node : recommendationsNode) {
                        recommendations.add(node.asLong());
                    }
                    log.info("Successfully got {} recommendations from Python service", recommendations.size());
                    return recommendations;
                } else {
                    log.warn("Python service response does not contain 'recommendations' array. Full response: {}", response.getBody());
                }
            } else {
                log.warn("Python service returned non-2xx status: {}", response.getStatusCode());
            }

            log.warn("Failed to get recommendations for userId: {}", userId);
            return new ArrayList<>();
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("Cannot connect to Python recommender service at {}. Is the service running? Error: {}", url, e.getMessage());
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error calling recommender service for userId: {} at URL: {}", userId, url, e);
            return new ArrayList<>();
        }
    }

    public List<Long> getSimilarProducts(Long productId) {
        String url = recommenderProperties.getBaseUrl() + "/similar-products?productId=" + productId;
        log.info("Calling Python recommender service: {}", url);

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            log.info("Python service response status: {}, body: {}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                JsonNode similarNode = jsonNode.get("similar");

                if (similarNode != null && similarNode.isArray()) {
                    List<Long> similar = new ArrayList<>();
                    for (JsonNode node : similarNode) {
                        similar.add(node.asLong());
                    }
                    log.info("Successfully got {} similar products from Python service", similar.size());
                    return similar;
                } else {
                    log.warn("Python service response does not contain 'similar' array. Full response: {}", response.getBody());
                }
            } else {
                log.warn("Python service returned non-2xx status: {}", response.getStatusCode());
            }

            log.warn("Failed to get similar products for productId: {}", productId);
            return new ArrayList<>();
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("Cannot connect to Python recommender service at {}. Is the service running? Error: {}", url, e.getMessage());
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error calling recommender service for productId: {} at URL: {}", productId, url, e);
            return new ArrayList<>();
        }
    }
}

