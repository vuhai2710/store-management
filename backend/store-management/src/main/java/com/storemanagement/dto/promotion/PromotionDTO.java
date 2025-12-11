package com.storemanagement.dto.promotion;

import com.storemanagement.dto.base.BaseDTO;
import com.storemanagement.model.Promotion;
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
public class PromotionDTO extends BaseDTO {
    private Integer idPromotion;
    private String code;
    private Promotion.DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private Integer usageLimit;
    private Integer usageCount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
}


