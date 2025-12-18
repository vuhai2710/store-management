package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.product.ProductOnSaleDTO;
import com.storemanagement.dto.promotion.*;
import com.storemanagement.model.Promotion;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface PromotionService {

    ValidatePromotionResponseDTO validatePromotion(ValidatePromotionRequestDTO request);

    CalculateDiscountResponseDTO calculateAutomaticDiscount(CalculateDiscountRequestDTO request, String customerType);

    BigDecimal calculateDiscountForOrder(BigDecimal totalAmount, String promotionCode, String customerType);

    BigDecimal calculateShippingDiscount(BigDecimal shippingFee, String shippingPromotionCode);

    CalculateDiscountResponseDTO calculateAutoShippingDiscount(BigDecimal shippingFee, BigDecimal orderTotal,
            String customerType);

    PromotionDTO createPromotion(PromotionDTO promotionDTO);

    PageResponse<PromotionDTO> getAllPromotions(String keyword, Pageable pageable);

    PageResponse<PromotionDTO> getAllPromotions(String keyword, Promotion.PromotionScope scope, Pageable pageable);

    PromotionDTO getPromotionById(Integer id);

    PromotionDTO updatePromotion(Integer id, PromotionDTO promotionDTO);

    void deletePromotion(Integer id);

    PromotionRuleDTO createPromotionRule(PromotionRuleDTO ruleDTO);

    PageResponse<PromotionRuleDTO> getAllPromotionRules(Pageable pageable);

    PromotionRuleDTO getPromotionRuleById(Integer id);

    PromotionRuleDTO updatePromotionRule(Integer id, PromotionRuleDTO ruleDTO);

    void deletePromotionRule(Integer id);

    void recordPromotionUsage(Integer promotionId, Integer orderId, Integer customerId);

    List<ProductOnSaleDTO> getProductsOnSale();
}
