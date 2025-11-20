package com.storemanagement.dto.promotion;

import com.storemanagement.model.PromotionRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalculateDiscountResponseDTO {
    private Boolean applicable;
    private BigDecimal discount;
    private PromotionRule.DiscountType discountType;
    private String ruleName;
    private Integer ruleId;
}