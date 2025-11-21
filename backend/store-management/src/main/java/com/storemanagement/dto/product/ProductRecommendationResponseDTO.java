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
    /**
     * 4 sản phẩm đầu tiên - những sản phẩm được xem nhiều nhất (đã xem gần đây)
     */
    private List<ProductDTO> mostViewedProducts;
    
    /**
     * 6 sản phẩm sau - gợi ý từ hệ thống
     */
    private List<ProductDTO> recommendedProducts;
    
    /**
     * Tất cả sản phẩm (mostViewedProducts + recommendedProducts)
     */
    private List<ProductDTO> allProducts;
}

