package com.storemanagement.controller;

import com.storemanagement.service.RecommenderClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final RecommenderClient recommenderClient;

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
}

