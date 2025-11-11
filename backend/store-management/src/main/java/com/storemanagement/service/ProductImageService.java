package com.storemanagement.service;

import com.storemanagement.dto.product.ProductImageDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface cho ProductImage
 * 
 * Quản lý nhiều ảnh cho một sản phẩm (tối đa 5 ảnh)
 */
public interface ProductImageService {
    
    /**
     * Upload nhiều ảnh cho sản phẩm (tối đa 5 ảnh)
     * Ảnh đầu tiên sẽ được đánh dấu là ảnh chính
     * 
     * @param productId ID sản phẩm
     * @param images Danh sách file ảnh
     * @return Danh sách ProductImageDTO đã upload
     */
    List<ProductImageDTO> uploadProductImages(Integer productId, List<MultipartFile> images);
    
    /**
     * Thêm một ảnh cho sản phẩm
     * 
     * @param productId ID sản phẩm
     * @param image File ảnh
     * @return ProductImageDTO đã thêm
     */
    ProductImageDTO addProductImage(Integer productId, MultipartFile image);
    
    /**
     * Xóa một ảnh của sản phẩm
     * Nếu xóa ảnh chính, ảnh tiếp theo sẽ trở thành ảnh chính
     * 
     * @param imageId ID của ảnh
     */
    void deleteProductImage(Integer imageId);
    
    /**
     * Đặt một ảnh làm ảnh chính
     * 
     * @param imageId ID của ảnh
     * @return ProductImageDTO đã cập nhật
     */
    ProductImageDTO setImageAsPrimary(Integer imageId);
    
    /**
     * Lấy tất cả ảnh của sản phẩm
     * 
     * @param productId ID sản phẩm
     * @return Danh sách ProductImageDTO
     */
    List<ProductImageDTO> getProductImages(Integer productId);
}










