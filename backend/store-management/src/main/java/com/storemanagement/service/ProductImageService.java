package com.storemanagement.service;

import com.storemanagement.dto.response.ProductImageDto;
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
     * @return Danh sách ProductImageDto đã upload
     */
    List<ProductImageDto> uploadProductImages(Integer productId, List<MultipartFile> images);
    
    /**
     * Thêm một ảnh cho sản phẩm
     * 
     * @param productId ID sản phẩm
     * @param image File ảnh
     * @return ProductImageDto đã thêm
     */
    ProductImageDto addProductImage(Integer productId, MultipartFile image);
    
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
     * @return ProductImageDto đã cập nhật
     */
    ProductImageDto setImageAsPrimary(Integer imageId);
    
    /**
     * Lấy tất cả ảnh của sản phẩm
     * 
     * @param productId ID sản phẩm
     * @return Danh sách ProductImageDto
     */
    List<ProductImageDto> getProductImages(Integer productId);
}








