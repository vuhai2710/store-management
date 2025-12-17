package com.storemanagement.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for products that are currently on sale (via active PRODUCT-scope
 * promotions).
 * Used for the homepage Flash Sale slider.
 */
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

    // Discount details
    private String discountLabel; // e.g. "-20%" or "-200,000đ"
    private String promotionName; // The promotion code/name

    // Optional additional info
    private Integer remainingStock;
    private Integer discountPercentage; // If percentage type
}
