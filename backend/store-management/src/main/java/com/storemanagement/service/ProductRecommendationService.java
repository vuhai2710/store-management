package com.storemanagement.service;

import com.storemanagement.dto.product.ProductRecommendationDTO;

import java.util.List;

/**
 * Service xử lý gợi ý sản phẩm sử dụng Content-based Filtering
 */
public interface ProductRecommendationService {
    
    /**
     * Lấy danh sách sản phẩm tương tự cho một sản phẩm
     * 
     * @param productId ID của sản phẩm cần tìm sản phẩm tương tự
     * @param topN Số lượng sản phẩm tương tự cần lấy (mặc định 5)
     * @return Danh sách sản phẩm tương tự
     */
    List<ProductRecommendationDTO> getRecommendedProducts(Integer productId, Integer topN);
    
    /**
     * Lấy danh sách sản phẩm gợi ý cho trang chủ
     * (Gợi ý dựa trên các sản phẩm phổ biến hoặc sản phẩm mới)
     * 
     * @param limit Số lượng sản phẩm cần lấy (mặc định 10)
     * @return Danh sách sản phẩm gợi ý
     */
    List<ProductRecommendationDTO> getHomePageRecommendations(Integer limit);
}

