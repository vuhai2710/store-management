package com.storemanagement.service.impl;

import com.storemanagement.dto.response.ProductImageDto;
import com.storemanagement.mapper.ProductImageMapper;
import com.storemanagement.model.Product;
import com.storemanagement.model.ProductImage;
import com.storemanagement.repository.ProductImageRepository;
import com.storemanagement.repository.ProductRepository;
import com.storemanagement.service.FileStorageService;
import com.storemanagement.service.ProductImageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

/**
 * Service implementation cho ProductImage
 * 
 * Business Rules:
 * - Tối đa 5 ảnh mỗi sản phẩm
 * - Ảnh đầu tiên được upload là ảnh chính (isPrimary = true)
 * - Khi xóa ảnh chính, ảnh có display_order nhỏ nhất tiếp theo sẽ trở thành ảnh chính
 * - Khi xóa ảnh, file vật lý cũng bị xóa
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductImageServiceImpl implements ProductImageService {
    
    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;
    private final ProductImageMapper productImageMapper;
    
    private static final int MAX_IMAGES_PER_PRODUCT = 5;
    
    @Override
    public List<ProductImageDto> uploadProductImages(Integer productId, List<MultipartFile> images) {
        log.info("Uploading {} images for product ID: {}", images.size(), productId);
        
        // Validate product tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + productId));
        
        // Kiểm tra số lượng ảnh hiện tại
        long currentImageCount = productImageRepository.countByProduct_IdProduct(productId);
        if (currentImageCount + images.size() > MAX_IMAGES_PER_PRODUCT) {
            throw new RuntimeException("Không thể upload. Sản phẩm chỉ được có tối đa " + MAX_IMAGES_PER_PRODUCT + " ảnh");
        }
        
        List<ProductImage> uploadedImages = new ArrayList<>();
        boolean isFirstImage = currentImageCount == 0;
        
        for (int i = 0; i < images.size(); i++) {
            MultipartFile image = images.get(i);
            
            try {
                // Upload ảnh và lấy URL
                String imageUrl = fileStorageService.saveImage(image, "products");
                
                // Tạo ProductImage entity
                ProductImage productImage = ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .isPrimary(isFirstImage && i == 0) // Ảnh đầu tiên là ảnh chính
                        .displayOrder((int) currentImageCount + i)
                        .build();
                
                ProductImage saved = productImageRepository.save(productImage);
                uploadedImages.add(saved);
                
                // Cập nhật imageUrl trong Product entity nếu là ảnh chính
                if (productImage.getIsPrimary()) {
                    product.setImageUrl(imageUrl);
                    productRepository.save(product);
                }
                
                log.info("Image uploaded successfully: {} (isPrimary: {})", imageUrl, productImage.getIsPrimary());
                
            } catch (Exception e) {
                log.error("Error uploading image {}: {}", i, e.getMessage());
                // Rollback các ảnh đã upload
                for (ProductImage uploaded : uploadedImages) {
                    try {
                        fileStorageService.deleteImage(uploaded.getImageUrl());
                    } catch (Exception ex) {
                        log.error("Error deleting rolled back image: {}", ex.getMessage());
                    }
                }
                throw new RuntimeException("Không thể upload ảnh: " + e.getMessage());
            }
        }
        
        return productImageMapper.toDtoList(uploadedImages);
    }
    
    @Override
    public ProductImageDto addProductImage(Integer productId, MultipartFile image) {
        log.info("Adding single image for product ID: {}", productId);
        
        // Validate product tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + productId));
        
        // Kiểm tra số lượng ảnh hiện tại
        long currentImageCount = productImageRepository.countByProduct_IdProduct(productId);
        if (currentImageCount >= MAX_IMAGES_PER_PRODUCT) {
            throw new RuntimeException("Không thể thêm ảnh. Sản phẩm chỉ được có tối đa " + MAX_IMAGES_PER_PRODUCT + " ảnh");
        }
        
        try {
            // Upload ảnh
            String imageUrl = fileStorageService.saveImage(image, "products");
            
            // Tạo ProductImage entity
            boolean isFirstImage = currentImageCount == 0;
            ProductImage productImage = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrl)
                    .isPrimary(isFirstImage)
                    .displayOrder((int) currentImageCount)
                    .build();
            
            ProductImage saved = productImageRepository.save(productImage);
            
            // Cập nhật imageUrl trong Product entity nếu là ảnh chính
            if (productImage.getIsPrimary()) {
                product.setImageUrl(imageUrl);
                productRepository.save(product);
            }
            
            log.info("Image added successfully: {} (isPrimary: {})", imageUrl, productImage.getIsPrimary());
            return productImageMapper.toDto(saved);
            
        } catch (Exception e) {
            log.error("Error adding image: {}", e.getMessage());
            throw new RuntimeException("Không thể thêm ảnh: " + e.getMessage());
        }
    }
    
    @Override
    public void deleteProductImage(Integer imageId) {
        log.info("Deleting product image ID: {}", imageId);
        
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Ảnh không tồn tại với ID: " + imageId));
        
        Integer productId = productImage.getProduct().getIdProduct();
        boolean wasPrimary = productImage.getIsPrimary();
        String imageUrl = productImage.getImageUrl();
        
        // Xóa entity khỏi database
        productImageRepository.delete(productImage);
        
        // Xóa file vật lý
        try {
            fileStorageService.deleteImage(imageUrl);
            log.info("Physical image file deleted: {}", imageUrl);
        } catch (Exception e) {
            log.error("Error deleting physical image file: {}", e.getMessage());
            // Không throw exception vì entity đã bị xóa
        }
        
        // Nếu ảnh bị xóa là ảnh chính, promote ảnh tiếp theo
        if (wasPrimary) {
            productImageRepository.findFirstByProductId(productId)
                    .ifPresent(newPrimaryImage -> {
                        newPrimaryImage.setIsPrimary(true);
                        productImageRepository.save(newPrimaryImage);
                        
                        // Cập nhật imageUrl trong Product entity
                        Product product = productRepository.findById(productId).orElse(null);
                        if (product != null) {
                            product.setImageUrl(newPrimaryImage.getImageUrl());
                            productRepository.save(product);
                        }
                        
                        log.info("Promoted image ID {} to primary", newPrimaryImage.getIdProductImage());
                    });
        }
        
        log.info("Product image deleted successfully");
    }
    
    @Override
    public ProductImageDto setImageAsPrimary(Integer imageId) {
        log.info("Setting image ID {} as primary", imageId);
        
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Ảnh không tồn tại với ID: " + imageId));
        
        Integer productId = productImage.getProduct().getIdProduct();
        
        // Bỏ isPrimary của ảnh chính hiện tại
        productImageRepository.findByProduct_IdProductAndIsPrimaryTrue(productId)
                .ifPresent(currentPrimary -> {
                    currentPrimary.setIsPrimary(false);
                    productImageRepository.save(currentPrimary);
                    log.info("Removed primary flag from image ID {}", currentPrimary.getIdProductImage());
                });
        
        // Đặt ảnh mới làm ảnh chính
        productImage.setIsPrimary(true);
        ProductImage saved = productImageRepository.save(productImage);
        
        // Cập nhật imageUrl trong Product entity
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setImageUrl(productImage.getImageUrl());
            productRepository.save(product);
        }
        
        log.info("Image set as primary successfully");
        return productImageMapper.toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductImageDto> getProductImages(Integer productId) {
        log.info("Getting all images for product ID: {}", productId);
        
        // Validate product tồn tại
        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + productId);
        }
        
        List<ProductImage> images = productImageRepository.findByProduct_IdProductOrderByDisplayOrderAsc(productId);
        return productImageMapper.toDtoList(images);
    }
}




