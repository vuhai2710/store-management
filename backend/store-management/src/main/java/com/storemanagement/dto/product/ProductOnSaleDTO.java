package com.storemanagement.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductOnSaleDTO {
    private Integer productId;
    private String name;
    private String image;
    private BigDecimal originalPrice;
    private BigDecimal discountedPrice;
    private LocalDateTime promotionEndTime;

    private String discountLabel;
    private String promotionName;

    private Integer remainingStock;
    private Integer discountPercentage;
}
