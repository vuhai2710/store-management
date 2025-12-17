package com.storemanagement.dto.promotion;

import com.storemanagement.dto.base.BaseDTO;
import com.storemanagement.model.PromotionRule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class PromotionRuleDTO extends BaseDTO {
    private Integer idRule;
    private String ruleName;
    private PromotionRule.DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private String customerType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private Integer priority;
    private PromotionRule.PromotionScope scope;
}

