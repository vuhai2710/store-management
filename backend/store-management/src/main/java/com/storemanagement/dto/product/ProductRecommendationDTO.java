package com.storemanagement.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho sản phẩm được gợi ý
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRecommendationDTO {
    private Integer productId;
    private String name;
    private Double similarity;  // Độ tương đồng (0-1)
    private String imageUrl;
    private BigDecimal price;
    private String category;
    private String brand;
}

