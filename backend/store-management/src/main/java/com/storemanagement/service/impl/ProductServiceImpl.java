package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.ProductDto;
import com.storemanagement.mapper.ProductMapper;
import com.storemanagement.model.Category;
import com.storemanagement.model.Product;
import com.storemanagement.model.Supplier;
import com.storemanagement.repository.CategoryRepository;
import com.storemanagement.repository.ProductRepository;
import com.storemanagement.repository.SupplierRepository;
import com.storemanagement.service.ProductService;
import com.storemanagement.utils.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductDto createProduct(ProductDto productDto) {
        log.info("Creating product: {}", productDto.getProductName());
        
        // Validate codeType
        if (productDto.getCodeType() == null) {
            throw new RuntimeException("Loại mã không hợp lệ");
        }
        
        // Kiểm tra category tồn tại
        Category category = categoryRepository.findById(productDto.getIdCategory())
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + productDto.getIdCategory()));
        
        // Xử lý productCode và SKU theo codeType
        String productCode = productDto.getProductCode();
        String sku = productDto.getSku();
        
        // Nếu codeType = SKU và không có productCode, tự sinh SKU
        if (productDto.getCodeType() == CodeType.SKU) {
            if (productCode == null || productCode.trim().isEmpty()) {
                // Tự sinh SKU theo category.code_prefix
                sku = generateUniqueSku(category);
                productCode = sku; // productCode = SKU
                log.info("Auto-generated SKU: {}", sku);
            } else {
                // Có productCode, validate nó
                ProductCodeValidator.validate(productCode, CodeType.SKU);
                sku = productCode; // SKU = productCode
            }
        } else {
            // Các loại code khác (IMEI, SERIAL, BARCODE): bắt buộc phải có productCode
            if (productCode == null || productCode.trim().isEmpty()) {
                throw new RuntimeException("Mã sản phẩm không được để trống");
            }
            // Validate productCode theo codeType
            ProductCodeValidator.validate(productCode, productDto.getCodeType());
        }
        
        // Kiểm tra productCode đã tồn tại chưa
        if (productRepository.findByProductCode(productCode).isPresent()) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + productCode);
        }
        
        // Kiểm tra SKU đã tồn tại chưa (nếu có)
        if (sku != null && !sku.isEmpty()) {
            if (productRepository.findBySku(sku).isPresent()) {
                throw new RuntimeException("SKU đã tồn tại: " + sku);
            }
        }
        
        // Kiểm tra supplier nếu có
        Supplier supplier = null;
        if (productDto.getIdSupplier() != null) {
            supplier = supplierRepository.findById(productDto.getIdSupplier())
                    .orElseThrow(() -> new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + productDto.getIdSupplier()));
        }
        
        // Map DTO sang Entity
        Product product = productMapper.toEntity(productDto);
        product.setCategory(category);
        product.setSupplier(supplier);
        product.setProductCode(productCode);
        product.setSku(sku);
        product.setCodeType(productDto.getCodeType());
        product.setBrand(productDto.getBrand());
        
        // Set default values và kiểm tra inventory
        if (product.getStockQuantity() == null) {
            product.setStockQuantity(0);
        } else if (product.getStockQuantity() < 0) {
            throw new RuntimeException("Số lượng tồn kho không được âm");
        }
        
        // Cập nhật status dựa trên stock quantity
        if (product.getStatus() == null) {
            product.setStatus(product.getStockQuantity() > 0 
                    ? ProductStatus.IN_STOCK 
                    : ProductStatus.OUT_OF_STOCK);
        } else {
            // Đồng bộ status với stock quantity
            if (product.getStockQuantity() > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.IN_STOCK);
            } else if (product.getStockQuantity() == 0 && product.getStatus() == ProductStatus.IN_STOCK) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
        }
        
        // Lưu vào DB
        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}, Stock: {}, Status: {}", 
                savedProduct.getIdProduct(), savedProduct.getStockQuantity(), savedProduct.getStatus());
        
        return productMapper.toDto(savedProduct);
    }

    @Override
    public ProductDto updateProduct(Integer id, ProductDto productDto) {
        log.info("Updating product ID: {}", id);
        
        // Tìm product theo ID
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        
        // Cập nhật codeType nếu có (nhưng phải validate lại productCode)
        if (productDto.getCodeType() != null && productDto.getCodeType() != product.getCodeType()) {
            // Thay đổi codeType, cần validate lại productCode
            if (product.getProductCode() != null) {
                ProductCodeValidator.validate(product.getProductCode(), productDto.getCodeType());
            }
            product.setCodeType(productDto.getCodeType());
        }
        
        // Kiểm tra productCode nếu thay đổi
        if (productDto.getProductCode() != null && !productDto.getProductCode().equals(product.getProductCode())) {
            // Validate productCode mới
            ProductCodeValidator.validate(productDto.getProductCode(), product.getCodeType());
            
            // Kiểm tra trùng lặp
            if (productRepository.findByProductCode(productDto.getProductCode()).isPresent()) {
                throw new RuntimeException("Mã sản phẩm đã tồn tại: " + productDto.getProductCode());
            }
            product.setProductCode(productDto.getProductCode());
        }
        
        // Kiểm tra SKU nếu thay đổi
        if (productDto.getSku() != null && !productDto.getSku().equals(product.getSku())) {
            if (productRepository.findBySku(productDto.getSku()).isPresent()) {
                throw new RuntimeException("SKU đã tồn tại: " + productDto.getSku());
            }
            product.setSku(productDto.getSku());
        }
        
        // Cập nhật category nếu thay đổi
        if (productDto.getIdCategory() != null && 
            !productDto.getIdCategory().equals(product.getCategory().getIdCategory())) {
            Category category = categoryRepository.findById(productDto.getIdCategory())
                    .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + productDto.getIdCategory()));
            product.setCategory(category);
        }
        
        // Cập nhật supplier nếu thay đổi
        if (productDto.getIdSupplier() != null) {
            if (product.getSupplier() == null || 
                !productDto.getIdSupplier().equals(product.getSupplier().getIdSupplier())) {
                Supplier supplier = supplierRepository.findById(productDto.getIdSupplier())
                        .orElseThrow(() -> new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + productDto.getIdSupplier()));
                product.setSupplier(supplier);
            }
        }
        
        // Cập nhật các trường khác
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
        // Cập nhật stock quantity và kiểm tra inventory
        if (productDto.getStockQuantity() != null) {
            if (productDto.getStockQuantity() < 0) {
                throw new RuntimeException("Số lượng tồn kho không được âm");
            }
            product.setStockQuantity(productDto.getStockQuantity());
        }
        
        // Đồng bộ status với stock quantity (ưu tiên logic tự động hơn manual set)
        if (productDto.getStatus() != null && productDto.getStockQuantity() == null) {
            // Chỉ cập nhật status nếu không thay đổi stock quantity
            product.setStatus(productDto.getStatus());
        } else {
            // Tự động cập nhật status dựa trên stock quantity
            if (product.getStockQuantity() != null) {
                if (product.getStockQuantity() > 0) {
                    product.setStatus(ProductStatus.IN_STOCK);
                } else {
                    product.setStatus(ProductStatus.OUT_OF_STOCK);
                }
            }
        }
        
        if (productDto.getImageUrl() != null) {
            product.setImageUrl(productDto.getImageUrl());
        }
        
        // Lưu lại
        Product updatedProduct = productRepository.save(product);
        log.info("Product updated successfully: ID={}, Stock={}, Status={}", 
                updatedProduct.getIdProduct(), updatedProduct.getStockQuantity(), updatedProduct.getStatus());
        
        return productMapper.toDto(updatedProduct);
    }

    @Override
    public void deleteProduct(Integer id) {
        log.info("Deleting product ID: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        
        productRepository.delete(product);
        log.info("Product deleted successfully: {}", id);
    }

    @Override
    public ProductDto getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        return productMapper.toDto(product);
    }

    @Override
    public ProductDto getProductByCode(String productCode) {
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với mã: " + productCode));
        return productMapper.toDto(product);
    }

    @Override
    public PageResponse<ProductDto> getAllProductsPaginated(Pageable pageable) {
        Page<Product> productPage = productRepository.findAll(pageable);
        List<ProductDto> productDtos = productMapper.toDtoList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDto> searchProductsByName(String name, Pageable pageable) {
        Page<Product> productPage = productRepository.findByProductNameContainingIgnoreCase(name, pageable);
        List<ProductDto> productDtos = productMapper.toDtoList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDto> getProductsByCategory(Integer idCategory, Pageable pageable) {
        // Kiểm tra category tồn tại
        if (!categoryRepository.existsById(idCategory)) {
            throw new EntityNotFoundException("Danh mục không tồn tại với ID: " + idCategory);
        }
        
        Page<Product> productPage = productRepository.findByCategory_IdCategory(idCategory, pageable);
        List<ProductDto> productDtos = productMapper.toDtoList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDto> getProductsByBrand(String brand, Pageable pageable) {
        if (brand == null || brand.trim().isEmpty()) {
            throw new RuntimeException("Thương hiệu không được để trống");
        }
        
        Page<Product> productPage = productRepository.findByBrandIgnoreCase(brand.trim(), pageable);
        List<ProductDto> productDtos = productMapper.toDtoList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }
    
    @Override
    public PageResponse<ProductDto> getProductsBySupplier(Integer idSupplier, Pageable pageable) {
        // Kiểm tra supplier tồn tại
        if (!supplierRepository.existsById(idSupplier)) {
            throw new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + idSupplier);
        }
        
        Page<Product> productPage = productRepository.findBySupplier_IdSupplier(idSupplier, pageable);
        List<ProductDto> productDtos = productMapper.toDtoList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDto> searchProducts(String productCode, String productName,
                                                   Integer idCategory, String brand,
                                                   Double minPrice, Double maxPrice,
                                                   Pageable pageable) {
        // Normalize parameters
        String normalizedCode = (productCode == null || productCode.trim().isEmpty()) ? null : productCode.trim();
        String normalizedName = (productName == null || productName.trim().isEmpty()) ? null : productName.trim();
        String normalizedBrand = (brand == null || brand.trim().isEmpty()) ? null : brand.trim();
        
        // Validate price range
        if (minPrice != null && minPrice < 0) {
            throw new RuntimeException("Giá tối thiểu phải >= 0");
        }
        if (maxPrice != null && maxPrice < 0) {
            throw new RuntimeException("Giá tối đa phải >= 0");
        }
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new RuntimeException("Giá tối thiểu không thể lớn hơn giá tối đa");
        }
        
        // Sử dụng @Query với JOIN FETCH đã được tối ưu trong repository
        Page<Product> productPage = productRepository.searchProducts(
            normalizedCode, normalizedName, idCategory, normalizedBrand, minPrice, maxPrice, pageable
        );
        
        List<ProductDto> productDtos = productMapper.toDtoList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }
    
    @Override
    public PageResponse<ProductDto> getProductsByPriceRange(Double minPrice, Double maxPrice, Pageable pageable) {
        // Validate price range
        if (minPrice != null && minPrice < 0) {
            throw new RuntimeException("Giá tối thiểu phải >= 0");
        }
        if (maxPrice != null && maxPrice < 0) {
            throw new RuntimeException("Giá tối đa phải >= 0");
        }
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new RuntimeException("Giá tối thiểu không thể lớn hơn giá tối đa");
        }
        
        Page<Product> productPage = productRepository.searchProducts(
            null, null, null, null, minPrice, maxPrice, pageable
        );
        
        List<ProductDto> productDtos = productMapper.toDtoList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }
    
    @Override
    public PageResponse<ProductDto> getBestSellingProducts(String orderStatus, Pageable pageable) {
        // orderStatus: null = tất cả orders, "COMPLETED" = chỉ đơn đã hoàn thành
        // Normalize: null hoặc empty string = null
        String normalizedStatus = (orderStatus == null || orderStatus.trim().isEmpty()) ? null : orderStatus.trim();
        
        int pageNo = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int offset = pageNo * pageSize;
        
        // Lấy danh sách product IDs đã bán chạy
        List<Object[]> bestSellingData = productRepository.findBestSellingProductIds(
            normalizedStatus, pageSize, offset
        );
        
        if (bestSellingData.isEmpty()) {
            // Không có sản phẩm nào đã bán
            return PageResponse.<ProductDto>builder()
                .content(List.of())
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(0L)
                .totalPages(0)
                .isFirst(true)
                .isLast(true)
                .hasNext(false)
                .hasPrevious(false)
                .isEmpty(true)
                .build();
        }
        
        // Extract product IDs từ kết quả và giữ nguyên thứ tự
        List<Integer> productIds = bestSellingData.stream()
            .map(row -> ((Number) row[0]).intValue())
            .toList();
        
        // Lấy full product info tất cả cùng lúc
        List<Product> allProducts = productRepository.findAllById(productIds);
        
        // Map theo thứ tự của productIds để giữ nguyên sort
        java.util.Map<Integer, Product> productMap = allProducts.stream()
            .collect(java.util.stream.Collectors.toMap(Product::getIdProduct, p -> p));
        
        List<Product> products = productIds.stream()
            .map(productMap::get)
            .filter(java.util.Objects::nonNull)
            .toList();
        
        // Eager load category và supplier
        products.forEach(p -> {
            if (p.getCategory() != null) {
                p.getCategory().getCategoryName(); // Trigger lazy load
            }
            if (p.getSupplier() != null) {
                p.getSupplier().getSupplierName(); // Trigger lazy load
            }
        });
        
        // Map to DTO
        List<ProductDto> productDtos = productMapper.toDtoList(products);
        
        // Count total
        Long totalElements = productRepository.countBestSellingProducts(normalizedStatus);
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        
        // Build PageResponse manually
        return PageResponse.<ProductDto>builder()
            .content(productDtos)
            .pageNo(pageNo)
            .pageSize(pageSize)
            .totalElements(totalElements)
            .totalPages(totalPages)
            .isFirst(pageNo == 0)
            .isLast(pageNo >= totalPages - 1)
            .hasNext(pageNo < totalPages - 1)
            .hasPrevious(pageNo > 0)
            .isEmpty(productDtos.isEmpty())
            .build();
    }
    
    /**
     * Sinh SKU unique theo category.code_prefix
     * Retry tối đa 5 lần nếu bị trùng
     */
    private String generateUniqueSku(Category category) {
        int maxRetries = 5;
        int attempt = 0;
        
        while (attempt < maxRetries) {
            String sku = SkuGenerator.generateSku(category);
            
            // Kiểm tra SKU đã tồn tại chưa
            if (productRepository.findBySku(sku).isEmpty()) {
                return sku;
            }
            
            attempt++;
            log.warn("SKU collision detected: {}, retrying... (attempt {}/{})", sku, attempt, maxRetries);
            
            // Sleep một chút để tránh collision
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        throw new RuntimeException("Không thể sinh SKU sau " + maxRetries + " lần thử");
    }
}
