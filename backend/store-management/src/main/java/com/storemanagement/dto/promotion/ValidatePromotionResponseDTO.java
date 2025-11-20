package com.storemanagement.dto.promotion;

import com.storemanagement.model.Promotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidatePromotionResponseDTO {
    private Boolean valid;
    private String message;
    private BigDecimal discount;
    private Promotion.DiscountType discountType;
    private String code;
}
