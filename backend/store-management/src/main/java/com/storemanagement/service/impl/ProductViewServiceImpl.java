package com.storemanagement.service.impl;

import com.storemanagement.model.ProductView;
import com.storemanagement.repository.ProductViewRepository;
import com.storemanagement.service.ProductViewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductViewServiceImpl implements ProductViewService {

    private final ProductViewRepository productViewRepository;

    @Override
    @Transactional
    public void logView(Integer userId, String sessionId, Integer productId) {
        try {
            ProductView productView = ProductView.builder()
                    .userId(userId)
                    .sessionId(sessionId)
                    .productId(productId)
                    .actionType("VIEW")
                    .build();
            
            ProductView saved = productViewRepository.save(productView);
            log.info("Successfully logged product view: id={}, userId={}, sessionId={}, productId={}", 
                    saved.getId(), userId, sessionId, productId);
        } catch (Exception e) {
            log.error("Failed to log product view: userId={}, sessionId={}, productId={}, error: {}", 
                    userId, sessionId, productId, e.getMessage(), e);
            throw e; // Re-throw để controller có thể thấy lỗi
        }
    }
}

