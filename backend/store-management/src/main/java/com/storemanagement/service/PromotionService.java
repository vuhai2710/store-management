package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.promotion.*;
import com.storemanagement.model.Promotion;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface PromotionService {

    ValidatePromotionResponseDTO validatePromotion(ValidatePromotionRequestDTO request);

    CalculateDiscountResponseDTO calculateAutomaticDiscount(CalculateDiscountRequestDTO request, String customerType);

    BigDecimal calculateDiscountForOrder(BigDecimal totalAmount, String promotionCode, String customerType);

    /**
     * Calculate shipping discount from shipping promotion code
     * 
     * @param shippingFee           the shipping fee to apply discount to
     * @param shippingPromotionCode the shipping promotion code
     * @return the shipping discount amount (capped at shippingFee)
     */
    BigDecimal calculateShippingDiscount(BigDecimal shippingFee, String shippingPromotionCode);

    PromotionDTO createPromotion(PromotionDTO promotionDTO);

    PageResponse<PromotionDTO> getAllPromotions(String keyword, Pageable pageable);

    /**
     * Get all promotions with optional scope filter
     */
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
}
