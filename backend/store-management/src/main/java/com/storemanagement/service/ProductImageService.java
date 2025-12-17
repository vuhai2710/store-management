package com.storemanagement.service;

import com.storemanagement.dto.product.ProductImageDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {

    List<ProductImageDTO> uploadProductImages(Integer productId, List<MultipartFile> images);

    ProductImageDTO addProductImage(Integer productId, MultipartFile image);

    void deleteProductImage(Integer imageId);

    ProductImageDTO setImageAsPrimary(Integer imageId);

    List<ProductImageDTO> getProductImages(Integer productId);
}
