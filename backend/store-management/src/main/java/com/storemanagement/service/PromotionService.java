package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.promotion.*;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface PromotionService {
    /**
     * Customer: Validate coupon code
     *
     * Validation:
     * - Code exists and is active
     * - Start date <= now <= end date
     * - Usage count < usage limit (if limit exists)
     * - Total amount >= min order amount
     *
     * Returns discount amount and type if valid
     */
    ValidatePromotionResponseDTO validatePromotion(ValidatePromotionRequestDTO request);

    /**
     * Customer: Calculate automatic discount
     *
     * Logic:
     * - Get all active rules in date range
     * - Filter by min_order_amount and customer_type
     * - Sort by priority (highest first)
     * - Apply first matching rule
     *
     * Returns discount amount and type if applicable
     */
    CalculateDiscountResponseDTO calculateAutomaticDiscount(CalculateDiscountRequestDTO request, String customerType);

    /**
     * Calculate discount for order
     *
     * Logic:
     * - If promotion code provided → validate and apply coupon
     * - If no coupon code → calculate automatic discount
     * - If neither → discount = 0
     *
     * Returns discount amount
     */
    BigDecimal calculateDiscountForOrder(BigDecimal totalAmount, String promotionCode, String customerType);

    /**
     * Admin: Create promotion
     */
    PromotionDTO createPromotion(PromotionDTO promotionDTO);

    /**
     * Admin: Get all promotions
     */
    PageResponse<PromotionDTO> getAllPromotions(Pageable pageable);

    /**
     * Admin: Get promotion by ID
     */
    PromotionDTO getPromotionById(Integer id);

    /**
     * Admin: Update promotion
     */
    PromotionDTO updatePromotion(Integer id, PromotionDTO promotionDTO);

    /**
     * Admin: Delete promotion
     */
    void deletePromotion(Integer id);

    /**
     * Admin: Create promotion rule
     */
    PromotionRuleDTO createPromotionRule(PromotionRuleDTO ruleDTO);

    /**
     * Admin: Get all promotion rules
     */
    PageResponse<PromotionRuleDTO> getAllPromotionRules(Pageable pageable);

    /**
     * Admin: Get promotion rule by ID
     */
    PromotionRuleDTO getPromotionRuleById(Integer id);

    /**
     * Admin: Update promotion rule
     */
    PromotionRuleDTO updatePromotionRule(Integer id, PromotionRuleDTO ruleDTO);

    /**
     * Admin: Delete promotion rule
     */
    void deletePromotionRule(Integer id);

    /**
     * Record promotion usage when order is created
     */
    void recordPromotionUsage(Integer promotionId, Integer orderId, Integer customerId);
}

