package com.storemanagement.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.storemanagement.dto.product.ProductImageDTO;
import com.storemanagement.mapper.ProductImageMapper;
import com.storemanagement.model.Product;
import com.storemanagement.model.ProductImage;
import com.storemanagement.repository.ProductImageRepository;
import com.storemanagement.repository.ProductRepository;
import com.storemanagement.service.ProductImageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final ProductImageMapper productImageMapper;
    
    // Thay thế ImageUploadService bằng Cloudinary
    private final Cloudinary cloudinary;

    private static final int MAX_IMAGES_PER_PRODUCT = 5;

    @Override
    public List<ProductImageDTO> uploadProductImages(Integer productId, List<MultipartFile> images) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

        long currentCount = productImageRepository.countByProduct_IdProduct(productId);
        if (currentCount + images.size() > MAX_IMAGES_PER_PRODUCT) {
            throw new RuntimeException("Tối đa " + MAX_IMAGES_PER_PRODUCT + " ảnh");
        }

        List<ProductImage> savedImages = new ArrayList<>();
        boolean isFirstImage = currentCount == 0;

        for (int i = 0; i < images.size(); i++) {
            MultipartFile file = images.get(i);

            try {
                // Upload lên Cloudinary vào folder "product_images"
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                        ObjectUtils.asMap("folder", "product_images"));
                
                String url = (String) uploadResult.get("secure_url");

                ProductImage pi = ProductImage.builder()
                        .product(product)
                        .imageUrl(url)
                        .isPrimary(isFirstImage && i == 0)
                        .displayOrder((int) (currentCount + i))
                        .build();

                pi = productImageRepository.save(pi);
                savedImages.add(pi);

                // Nếu là ảnh chính → cập nhật vào bảng products
                if (pi.getIsPrimary()) {
                    product.setImageUrl(url);
                    productRepository.save(product);
                }
                
                log.info("Uploaded product image: {}", url);

            } catch (IOException e) {
                log.error("Error uploading image for product {}: {}", productId, e.getMessage());
                throw new RuntimeException("Lỗi khi upload ảnh: " + e.getMessage());
            }
        }

        return productImageMapper.toDTOList(savedImages);
    }

    @Override
    public ProductImageDTO addProductImage(Integer productId, MultipartFile image) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));

        long count = productImageRepository.countByProduct_IdProduct(productId);
        if (count >= MAX_IMAGES_PER_PRODUCT) {
            throw new RuntimeException("Tối đa " + MAX_IMAGES_PER_PRODUCT + " ảnh");
        }

        try {
            // Upload Cloudinary
            Map uploadResult = cloudinary.uploader().upload(image.getBytes(), 
                    ObjectUtils.asMap("folder", "product_images"));
            String url = (String) uploadResult.get("secure_url");

            boolean isFirst = count == 0;

            ProductImage pi = ProductImage.builder()
                    .product(product)
                    .imageUrl(url)
                    .isPrimary(isFirst)
                    .displayOrder((int) count)
                    .build();

            pi = productImageRepository.save(pi);

            if (pi.getIsPrimary()) {
                product.setImageUrl(url);
                productRepository.save(product);
            }
            
            log.info("Added single product image: {}", url);
            return productImageMapper.toDTO(pi);

        } catch (IOException e) {
            log.error("Error uploading single image for product {}: {}", productId, e.getMessage());
            throw new RuntimeException("Lỗi khi upload ảnh: " + e.getMessage());
        }
    }

    @Override
    public void deleteProductImage(Integer imageId) {

        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Ảnh không tồn tại"));

        Integer productId = productImage.getProduct().getIdProduct();
        boolean wasPrimary = productImage.getIsPrimary();

        // Lưu ý: Tạm thời chỉ xóa trong Database, không xóa trên Cloudinary 
        // để tránh lỗi thiếu public_id hoặc cấu hình.
        productImageRepository.delete(productImage);
        log.info("Deleted product image from DB: {}", imageId);

        // Nếu xoá ảnh chính → chuyển ảnh tiếp theo thành primary
        if (wasPrimary) {
            productImageRepository.findFirstByProductId(productId)
                    .ifPresent(newPrimary -> {
                        newPrimary.setIsPrimary(true);
                        productImageRepository.save(newPrimary);

                        Product product = productRepository.findById(productId).orElse(null);
                        if (product != null) {
                            product.setImageUrl(newPrimary.getImageUrl());
                            productRepository.save(product);
                        }
                    });
        }
    }

    @Override
    public ProductImageDTO setImageAsPrimary(Integer imageId) {

        ProductImage newPrimary = productImageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Ảnh không tồn tại"));

        Integer productId = newPrimary.getProduct().getIdProduct();

        productImageRepository.findByProduct_IdProductAndIsPrimaryTrue(productId)
                .ifPresent(old -> {
                    old.setIsPrimary(false);
                    productImageRepository.save(old);
                });

        newPrimary.setIsPrimary(true);
        productImageRepository.save(newPrimary);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setImageUrl(newPrimary.getImageUrl());
            productRepository.save(product);
        }

        return productImageMapper.toDTO(newPrimary);
    }

    @Override
    public List<ProductImageDTO> getProductImages(Integer productId) {

        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("Sản phẩm không tồn tại");
        }

        List<ProductImage> images = productImageRepository
                .findByProduct_IdProductOrderByDisplayOrderAsc(productId);

        return productImageMapper.toDTOList(images);
    }
}
