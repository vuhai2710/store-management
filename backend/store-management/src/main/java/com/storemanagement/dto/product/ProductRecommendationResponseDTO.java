package com.storemanagement.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRecommendationResponseDTO {

    private List<ProductDTO> mostViewedProducts;

    private List<ProductDTO> recommendedProducts;

    private List<ProductDTO> allProducts;
}

