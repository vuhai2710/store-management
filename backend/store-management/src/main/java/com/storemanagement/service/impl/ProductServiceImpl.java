package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.mapper.ProductMapper;
import com.storemanagement.model.Category;
import com.storemanagement.model.Product;
import com.storemanagement.model.Supplier;
import com.storemanagement.repository.CategoryRepository;
import com.storemanagement.repository.ProductRepository;
import com.storemanagement.repository.SupplierRepository;
import com.storemanagement.repository.ProductReviewRepository;
import com.storemanagement.service.FileStorageService;
import com.storemanagement.service.ProductService;
import com.storemanagement.utils.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;
    private final FileStorageService fileStorageService;
    private final ProductReviewRepository productReviewRepository;

    @Override
    public ProductDTO createProduct(ProductDTO productDto) {
        return createProduct(productDto, null);
    }

    @Override
    public ProductDTO createProduct(ProductDTO productDto, MultipartFile image) {
        log.info("Creating product: {}", productDto.getProductName());

        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = fileStorageService.saveImage(image, "products");
                productDto.setImageUrl(imageUrl);
                log.info("Image uploaded successfully: {}", imageUrl);
            } catch (Exception e) {
                log.error("Error uploading image: {}", e.getMessage(), e);
                throw new RuntimeException("Không thể upload ảnh: " + e.getMessage());
            }
        }

        if (productDto.getCodeType() == null) {
            throw new RuntimeException("Loại mã không hợp lệ");
        }

        Category category = categoryRepository.findById(productDto.getIdCategory())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Danh mục không tồn tại với ID: " + productDto.getIdCategory()));

        String productCode = productDto.getProductCode();
        String sku = productDto.getSku();

        if (productDto.getCodeType() == CodeType.SKU) {
            if (productCode == null || productCode.trim().isEmpty()) {
                sku = generateUniqueSku(category);
                productCode = sku;
                log.info("Auto-generated SKU: {}", sku);
            } else {
                ProductCodeValidator.validate(productCode, CodeType.SKU);
                sku = productCode;
            }
        } else {
            if (productCode == null || productCode.trim().isEmpty()) {
                throw new RuntimeException("Mã sản phẩm không được để trống");
            }
            ProductCodeValidator.validate(productCode, productDto.getCodeType());
        }

        if (productRepository.findByProductCode(productCode).isPresent()) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + productCode);
        }

        if (sku != null && !sku.isEmpty()) {
            if (productRepository.findBySku(sku).isPresent()) {
                throw new RuntimeException("SKU đã tồn tại: " + sku);
            }
        }

        Supplier supplier = null;
        if (productDto.getIdSupplier() != null) {
            supplier = supplierRepository.findById(productDto.getIdSupplier())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Nhà cung cấp không tồn tại với ID: " + productDto.getIdSupplier()));
        }

        Product product = productMapper.toEntity(productDto);
        product.setCategory(category);
        product.setSupplier(supplier);
        product.setProductCode(productCode);
        product.setSku(sku);
        product.setCodeType(productDto.getCodeType());
        product.setBrand(productDto.getBrand());
        product.setDescription(productDto.getDescription());
        product.setIsDelete(false); // New products are not deleted by default

        if (productDto.getImageUrl() != null) {
            product.setImageUrl(productDto.getImageUrl());
        }

        product.setPrice(java.math.BigDecimal.ZERO);
        product.setStockQuantity(0);
        product.setStatus(ProductStatus.OUT_OF_STOCK);

        log.info("New product will be created with price=0, stockQuantity=0 and status=OUT_OF_STOCK. " +
                "Use ImportOrder to add stock and update price.");

        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}, Stock: {}, Status: {}",
                savedProduct.getIdProduct(), savedProduct.getStockQuantity(), savedProduct.getStatus());

        Product productWithDetails = productRepository.findByIdWithDetails(savedProduct.getIdProduct())
                .orElse(savedProduct);

        return productMapper.toDTO(productWithDetails);
    }

    @Override
    public ProductDTO updateProduct(Integer id, ProductDTO productDto, MultipartFile image) {
        log.info("Updating product ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));

        if (productDto.getCodeType() != null && productDto.getCodeType() != product.getCodeType()) {
            if (product.getProductCode() != null) {
                ProductCodeValidator.validate(product.getProductCode(), productDto.getCodeType());
            }
            product.setCodeType(productDto.getCodeType());
        }

        if (productDto.getProductCode() != null && !productDto.getProductCode().equals(product.getProductCode())) {
            ProductCodeValidator.validate(productDto.getProductCode(), product.getCodeType());

            if (productRepository.findByProductCode(productDto.getProductCode()).isPresent()) {
                throw new RuntimeException("Mã sản phẩm đã tồn tại: " + productDto.getProductCode());
            }
            product.setProductCode(productDto.getProductCode());
        }

        if (productDto.getSku() != null && !productDto.getSku().equals(product.getSku())) {
            if (productRepository.findBySku(productDto.getSku()).isPresent()) {
                throw new RuntimeException("SKU đã tồn tại: " + productDto.getSku());
            }
            product.setSku(productDto.getSku());
        }

        if (productDto.getIdCategory() != null &&
                !productDto.getIdCategory().equals(product.getCategory().getIdCategory())) {
            Category category = categoryRepository.findById(productDto.getIdCategory())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Danh mục không tồn tại với ID: " + productDto.getIdCategory()));
            product.setCategory(category);
        }

        if (productDto.getIdSupplier() != null) {
            if (product.getSupplier() == null ||
                    !productDto.getIdSupplier().equals(product.getSupplier().getIdSupplier())) {
                Supplier supplier = supplierRepository.findById(productDto.getIdSupplier())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Nhà cung cấp không tồn tại với ID: " + productDto.getIdSupplier()));
                product.setSupplier(supplier);
            }
        }

        if (productDto.getProductName() != null) {
            product.setProductName(productDto.getProductName());
        }
        if (productDto.getBrand() != null) {
            product.setBrand(productDto.getBrand());
        }
        if (productDto.getDescription() != null) {
            product.setDescription(productDto.getDescription());
        }
        if (productDto.getPrice() != null) {
            product.setPrice(productDto.getPrice());
        }

        if (productDto.getStatus() != null) {
            product.setStatus(productDto.getStatus());
        }

        if (image != null && !image.isEmpty()) {
            try {
                if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                    fileStorageService.deleteImage(product.getImageUrl());
                    log.info("Deleted old image: {}", product.getImageUrl());
                }

                String imageUrl = fileStorageService.saveImage(image, "products");
                product.setImageUrl(imageUrl);
                log.info("New image uploaded successfully: {}", imageUrl);
            } catch (Exception e) {
                log.error("Error uploading image: {}", e.getMessage(), e);
                throw new RuntimeException("Không thể upload ảnh: " + e.getMessage());
            }
        } else if (productDto.getImageUrl() != null) {
            product.setImageUrl(productDto.getImageUrl());
        }

        Product updatedProduct = productRepository.save(product);
        log.info("Product updated successfully: ID={}, Stock={}, Status={}",
                updatedProduct.getIdProduct(), updatedProduct.getStockQuantity(), updatedProduct.getStatus());

        Product productWithDetails = productRepository.findByIdWithDetails(updatedProduct.getIdProduct())
                .orElse(updatedProduct);

        return productMapper.toDTO(productWithDetails);
    }

    @Override
    public ProductDTO updateProduct(Integer id, ProductDTO productDto) {
        return updateProduct(id, productDto, null);
    }

    @Override
    public void deleteProduct(Integer id) {
        log.info("Soft deleting product ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        product.setIsDelete(true);
        productRepository.save(product);
        log.info("Product soft-deleted successfully: {}", id);
    }

    @Override
    public void restoreProduct(Integer id) {
        log.info("Restoring product ID: {}", id);
        Product product = productRepository.findByIdProductAndIsDeleteTrue(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Sản phẩm không tồn tại hoặc không ở trạng thái đã xóa với ID: " + id));
        product.setIsDelete(false);
        productRepository.save(product);
        log.info("Product restored successfully: {}", id);
    }

    @Override
    public ProductDTO getProductById(Integer id, Boolean showDeleted) {
        log.info("Fetching product by ID: {}, showDeleted: {}", id, showDeleted);
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;

        Optional<Product> productOpt = effectiveShowDeleted ? productRepository.findByIdWithDetailsIncludeDeleted(id)
                : productRepository.findByIdWithDetails(id);

        Product product = productOpt
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại with ID: " + id));
        ProductDTO dto = productMapper.toDTO(product);
        enrichProductDtoWithRating(dto);
        dto.setIsDelete(product.getIsDelete());
        return dto;
    }

    @Override
    public ProductDTO getProductByCode(String productCode, Boolean showDeleted) {
        log.info("Fetching product by code: {}, showDeleted: {}", productCode, showDeleted);
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;

        Optional<Product> productOpt = effectiveShowDeleted ? productRepository.findByProductCode(productCode)
                : productRepository.findByProductCodeAndIsDeleteFalse(productCode);

        Product product = productOpt
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại with mã: " + productCode));

        Product productWithDetails = effectiveShowDeleted
                ? productRepository.findByIdWithDetailsIncludeDeleted(product.getIdProduct()).orElse(product)
                : productRepository.findByIdWithDetails(product.getIdProduct()).orElse(product);

        ProductDTO dto = productMapper.toDTO(productWithDetails);
        enrichProductDtoWithRating(dto);
        dto.setIsDelete(productWithDetails.getIsDelete());
        return dto;
    }

    @Override
    public PageResponse<ProductDTO> getAllProductsPaginated(Pageable pageable, Boolean showDeleted) {
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;
        Page<Product> productPage = productRepository.searchProducts(null, null, null, null, null, null, null,
                effectiveShowDeleted,
                pageable);
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        enrichProductDtoListWithRating(productDtos);
        for (int i = 0; i < productDtos.size(); i++) {
            productDtos.get(i).setIsDelete(productPage.getContent().get(i).getIsDelete());
        }
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> searchProductsByName(String name, Pageable pageable, Boolean showDeleted) {
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;
        Page<Product> productPage;
        if (effectiveShowDeleted) {
            productPage = productRepository.findByProductNameContainingIgnoreCase(name, pageable);
        } else {
            productPage = productRepository.findByProductNameContainingIgnoreCaseAndIsDeleteFalse(name, pageable);
        }
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        enrichProductDtoListWithRating(productDtos);
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> getProductsByCategory(Integer idCategory, Pageable pageable, Boolean showDeleted) {
        if (!categoryRepository.existsById(idCategory)) {
            throw new EntityNotFoundException("Danh mục không tồn tại với ID: " + idCategory);
        }
        return searchProducts(null, idCategory, null, null, null, null, null, showDeleted, pageable);
    }

    @Override
    public PageResponse<ProductDTO> getProductsByBrand(String brand, Pageable pageable, Boolean showDeleted) {
        if (brand == null || brand.trim().isEmpty()) {
            throw new RuntimeException("Thương hiệu không được để trống");
        }
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;
        Page<Product> productPage;
        if (effectiveShowDeleted) {
            productPage = productRepository.findByBrandIgnoreCase(brand.trim(), pageable);
        } else {
            productPage = productRepository.findByBrandIgnoreCaseAndIsDeleteFalse(brand.trim(), pageable);
        }
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        enrichProductDtoListWithRating(productDtos);
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> getProductsBySupplier(Integer idSupplier, Pageable pageable, Boolean showDeleted) {
        if (!supplierRepository.existsById(idSupplier)) {
            throw new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + idSupplier);
        }
        return searchProducts(null, null, idSupplier, null, null, null, null, showDeleted, pageable);
    }

    @Override
    public PageResponse<ProductDTO> searchProducts(String keyword, Integer idCategory, Integer idSupplier, String brand,
            Double minPrice, Double maxPrice, String inventoryStatus, Boolean showDeleted, Pageable pageable) {
        String normalizedKeyword = (keyword == null || keyword.trim().isEmpty()) ? null : keyword.trim();
        String normalizedBrand = (brand == null || brand.trim().isEmpty()) ? null : brand.trim();
        String normalizedInventoryStatus = (inventoryStatus == null || inventoryStatus.trim().isEmpty()) ? null
                : inventoryStatus.trim();
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;

        if (normalizedInventoryStatus != null) {
            try {
                com.storemanagement.utils.InventoryStatusFilter.valueOf(normalizedInventoryStatus);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Trạng thái tồn kho không hợp lệ");
            }
        }

        Page<Product> productPage = productRepository.searchProducts(normalizedKeyword, idCategory, idSupplier,
                normalizedBrand,
                minPrice, maxPrice, normalizedInventoryStatus, effectiveShowDeleted, pageable);
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        enrichProductDtoListWithRating(productDtos);
        for (int i = 0; i < productDtos.size(); i++) {
            productDtos.get(i).setIsDelete(productPage.getContent().get(i).getIsDelete());
        }
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> getProductsByPriceRange(Double minPrice, Double maxPrice, Pageable pageable,
            Boolean showDeleted) {
        return searchProducts(null, null, null, null, minPrice, maxPrice, null, showDeleted, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getTop5BestSellingProducts(String orderStatus, Boolean showDeleted) {
        String normalizedStatus = (orderStatus == null || orderStatus.trim().isEmpty()) ? null : orderStatus.trim();
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;
        List<Object[]> bestSellingData = productRepository.findBestSellingProductIds(normalizedStatus, 5, 0);
        if (bestSellingData.isEmpty())
            return List.of();
        List<Integer> productIds = bestSellingData.stream().map(row -> ((Number) row[0]).intValue()).toList();
        List<Product> products;
        if (effectiveShowDeleted) {
            products = productRepository.findByIdProductIn(productIds);
        } else {
            products = productRepository.findByIdProductInAndIsDeleteFalse(productIds);
        }
        List<ProductDTO> productDtos = productMapper.toDTOList(products);
        enrichProductDtoListWithRating(productDtos);
        return productDtos;
    }

    @Override
    public PageResponse<ProductDTO> getBestSellingProducts(String orderStatus, Pageable pageable, Boolean showDeleted) {
        String normalizedStatus = (orderStatus == null || orderStatus.trim().isEmpty()) ? null : orderStatus.trim();
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;
        int pageNo = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int offset = pageNo * pageSize;
        List<Object[]> bestSellingData = productRepository.findBestSellingProductIds(normalizedStatus, pageSize,
                offset);
        if (bestSellingData.isEmpty()) {
            return PageResponse.<ProductDTO>builder().content(List.of()).pageNo(pageNo).pageSize(pageSize)
                    .totalElements(0L).totalPages(0).isFirst(true).isLast(true).hasNext(false).hasPrevious(false)
                    .isEmpty(true).build();
        }
        List<Integer> productIds = bestSellingData.stream().map(row -> ((Number) row[0]).intValue()).toList();
        List<Product> products;
        if (effectiveShowDeleted) {
            products = productRepository.findByIdProductIn(productIds);
        } else {
            products = productRepository.findByIdProductInAndIsDeleteFalse(productIds);
        }
        List<ProductDTO> productDtos = productMapper.toDTOList(products);
        enrichProductDtoListWithRating(productDtos);
        Long totalElements = productRepository.countBestSellingProducts(normalizedStatus);
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        return PageResponse.<ProductDTO>builder().content(productDtos).pageNo(pageNo).pageSize(pageSize)
                .totalElements(totalElements).totalPages(totalPages).isFirst(pageNo == 0)
                .isLast(pageNo >= totalPages - 1).hasNext(pageNo < totalPages - 1).hasPrevious(pageNo > 0)
                .isEmpty(productDtos.isEmpty()).build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductDTO> getNewProducts(Pageable pageable, Integer limit, Boolean showDeleted) {
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;
        Page<Product> productPage;
        if (effectiveShowDeleted) {
            productPage = productRepository.findAll(pageable); // Simplified, or use a custom one for new products
                                                               // including deleted
        } else {
            productPage = productRepository.findNewProductsByStatus(pageable);
        }
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        if (limit != null && limit > 0 && productDtos.size() > limit) {
            productDtos = productDtos.subList(0, limit);
        }
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getRelatedProducts(Integer productId, Integer limit, Boolean showDeleted) {
        Product currentProduct = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại"));
        if (currentProduct.getCategory() == null)
            return List.of();
        Integer categoryId = currentProduct.getCategory().getIdCategory();
        Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit != null ? limit : 8);
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;
        List<Product> relatedProducts;
        if (effectiveShowDeleted) {
            relatedProducts = productRepository.findByCategory_IdCategoryAndIdProductNot(categoryId, productId,
                    pageable).getContent();
        } else {
            relatedProducts = productRepository.findByCategoryIdAndStatusAndIdProductNot(categoryId,
                    productId, pageable);
        }
        List<ProductDTO> productDtos = productMapper.toDTOList(relatedProducts);
        enrichProductDtoListWithRating(productDtos);
        return productDtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllBrands(Boolean showDeleted) {
        Boolean effectiveShowDeleted = showDeleted != null ? showDeleted : false;
        if (effectiveShowDeleted) {
            return productRepository.findDistinctBrands().stream().filter(b -> b != null && !b.trim().isEmpty())
                    .sorted().toList();
        } else {
            return productRepository.findDistinctBrandsByStatus().stream().filter(b -> b != null && !b.trim().isEmpty())
                    .sorted().toList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByIds(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty())
            return List.of();
        List<Integer> intIds = productIds.stream().map(Long::intValue).toList();
        List<Product> products = productRepository.findByIdProductInAndIsDeleteFalse(intIds);
        return productMapper.toDTOList(products);
    }

    private String generateUniqueSku(Category category) {
        String sku = SkuGenerator.generateSku(category);
        if (productRepository.findBySku(sku).isEmpty())
            return sku;
        return SkuGenerator.generateSku(category); // Simple retry
    }

    private void enrichProductDtoWithRating(ProductDTO dto) {
        if (dto == null || dto.getIdProduct() == null)
            return;
        Double avg = productReviewRepository.getAverageRatingByProductId(dto.getIdProduct());
        long count = productReviewRepository.countByProductIdProduct(dto.getIdProduct());
        dto.setAverageRating(avg != null ? avg : 0.0);
        dto.setReviewCount((int) count);
    }

    private void enrichProductDtoListWithRating(List<ProductDTO> dtos) {
        if (dtos != null)
            dtos.forEach(this::enrichProductDtoWithRating);
    }
}
