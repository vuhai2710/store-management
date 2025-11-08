package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.response.ProductDto;
import com.storemanagement.mapper.ProductMapper;
import com.storemanagement.model.Category;
import com.storemanagement.model.Product;
import com.storemanagement.model.Supplier;
import com.storemanagement.repository.CategoryRepository;
import com.storemanagement.repository.ProductRepository;
import com.storemanagement.repository.SupplierRepository;
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

/**
 * Service implementation cho Product (Sản phẩm)
 * 
 * Chức năng chính:
 * 1. CRUD operations cho sản phẩm
 * 2. Upload và quản lý ảnh sản phẩm
 * 3. Xử lý product code và SKU (tự động sinh hoặc validate)
 * 4. Tìm kiếm và lọc sản phẩm (theo category, brand, price, etc.)
 * 5. Quản lý stock quantity và status
 * 
 * Business Logic quan trọng:
 * - Product Code: Có thể là SKU (tự sinh) hoặc MANUAL (tự nhập)
 * - SKU: Tự động sinh theo format: {category_prefix}-{sequence}
 * - Image: Upload vào thư mục uploads/products/, lưu URL vào database
 * - Stock: Tự động cập nhật khi có đơn nhập hàng (ImportOrderService)
 * 
 * @author Store Management Team
 */
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

    /**
     * Overload method - tạo sản phẩm không có ảnh
     */
    @Override
    public ProductDto createProduct(ProductDto productDto) {
        return createProduct(productDto, null);
    }
    
    /**
     * Tạo sản phẩm mới
     * 
     * Flow xử lý:
     * 1. Upload ảnh nếu có (lưu vào uploads/products/)
     * 2. Validate category tồn tại
     * 3. Xử lý productCode và SKU:
     *    - Nếu codeType = SKU: có thể tự sinh hoặc tự nhập
     *    - Nếu codeType = MANUAL: bắt buộc phải có productCode
     * 4. Validate productCode/SKU chưa tồn tại
     * 5. Validate supplier (nếu có)
     * 6. Tạo và lưu Product entity
     * 
     * @param productDto DTO chứa thông tin sản phẩm
     * @param image File ảnh (optional) - multipart/form-data
     * @return ProductDto đã được tạo với ID
     */
    @Override
    public ProductDto createProduct(ProductDto productDto, MultipartFile image) {
        log.info("Creating product: {}", productDto.getProductName());
        
        // Bước 1: Xử lý upload ảnh nếu có
        // Ảnh được lưu vào thư mục: uploads/products/{filename}
        // URL được lưu vào database: /uploads/products/{filename}
        if (image != null && !image.isEmpty()) {
            try {
                // FileStorageService sẽ:
                // - Validate file type (chỉ cho phép image)
                // - Validate file size (max 10MB)
                // - Generate unique filename để tránh conflict
                // - Lưu vào thư mục uploads/products/
                // - Trả về URL để lưu vào database
                String imageUrl = fileStorageService.saveImage(image, "products");
                productDto.setImageUrl(imageUrl);
                log.info("Image uploaded successfully: {}", imageUrl);
            } catch (Exception e) {
                log.error("Error uploading image: {}", e.getMessage(), e);
                throw new RuntimeException("Không thể upload ảnh: " + e.getMessage());
            }
        }
        
        // Bước 2: Validate codeType (bắt buộc)
        if (productDto.getCodeType() == null) {
            throw new RuntimeException("Loại mã không hợp lệ");
        }
        
        // Bước 3: Kiểm tra category tồn tại
        Category category = categoryRepository.findById(productDto.getIdCategory())
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + productDto.getIdCategory()));
        
        // Bước 4: Xử lý productCode và SKU theo codeType
        // Có 2 loại: SKU (tự động sinh) và MANUAL (tự nhập)
        String productCode = productDto.getProductCode();
        String sku = productDto.getSku();
        
        if (productDto.getCodeType() == CodeType.SKU) {
            // CodeType = SKU: có thể tự sinh hoặc tự nhập
            if (productCode == null || productCode.trim().isEmpty()) {
                // Tự sinh SKU theo format: {category_prefix}-{sequence}
                // Ví dụ: "DT-001", "DT-002" (nếu category prefix = "DT")
                sku = generateUniqueSku(category);
                productCode = sku; // productCode = SKU trong trường hợp này
                log.info("Auto-generated SKU: {}", sku);
            } else {
                // User tự nhập productCode, validate format
                ProductCodeValidator.validate(productCode, CodeType.SKU);
                sku = productCode; // SKU = productCode khi user tự nhập
            }
        } else {
            // CodeType = MANUAL: bắt buộc phải có productCode
            if (productCode == null || productCode.trim().isEmpty()) {
                throw new RuntimeException("Mã sản phẩm không được để trống");
            }
            // Validate productCode theo format của codeType
            ProductCodeValidator.validate(productCode, productDto.getCodeType());
        }
        
        // Bước 5: Kiểm tra productCode chưa tồn tại (unique constraint)
        if (productRepository.findByProductCode(productCode).isPresent()) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + productCode);
        }
        
        // Bước 6: Kiểm tra SKU chưa tồn tại (nếu có)
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
        return updateProduct(id, productDto, null);
    }
    
    @Override
    public ProductDto updateProduct(Integer id, ProductDto productDto, MultipartFile image) {
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
        
        // Xử lý upload ảnh mới nếu có
        if (image != null && !image.isEmpty()) {
            try {
                // Xóa ảnh cũ nếu có
                if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                    fileStorageService.deleteImage(product.getImageUrl());
                    log.info("Deleted old image: {}", product.getImageUrl());
                }
                
                // Upload ảnh mới
                String imageUrl = fileStorageService.saveImage(image, "products");
                product.setImageUrl(imageUrl);
                log.info("New image uploaded successfully: {}", imageUrl);
            } catch (Exception e) {
                log.error("Error uploading image: {}", e.getMessage(), e);
                throw new RuntimeException("Không thể upload ảnh: " + e.getMessage());
            }
        } else if (productDto.getImageUrl() != null) {
            // Nếu không có file mới nhưng có imageUrl trong DTO, giữ nguyên hoặc cập nhật URL
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
        
        // Xóa ảnh sản phẩm nếu có
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            try {
                fileStorageService.deleteImage(product.getImageUrl());
                log.info("Deleted product image: {}", product.getImageUrl());
            } catch (Exception e) {
                log.warn("Error deleting product image: {}", e.getMessage());
                // Không throw exception để không ảnh hưởng đến việc xóa sản phẩm
            }
        }
        
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
     * Lấy sản phẩm mới (sắp xếp theo createdAt DESC)
     * 
     * Logic:
     * - Lấy sản phẩm có status = IN_STOCK
     * - Sắp xếp theo createdAt DESC (mới nhất trước)
     * - Nếu có limit, giới hạn số lượng kết quả
     * - Dùng cho trang chủ, banner "Sản phẩm mới"
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getNewProducts(Pageable pageable, Integer limit) {
        // Nếu có limit, tạo Pageable mới với limit làm pageSize
        Pageable queryPageable = pageable;
        if (limit != null && limit > 0) {
            queryPageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                Math.min(limit, pageable.getPageSize()),
                pageable.getSort()
            );
        }
        
        // Query products với status = IN_STOCK, sắp xếp theo createdAt DESC
        Page<Product> productPage = productRepository.findNewProductsByStatus(queryPageable);
        
        List<ProductDto> productDtos = productMapper.toDtoList(productPage.getContent());
        
        // Nếu có limit và số lượng kết quả > limit, cắt danh sách
        if (limit != null && limit > 0 && productDtos.size() > limit) {
            List<ProductDto> limitedDtos = productDtos.subList(0, limit);
            return PageResponse.<ProductDto>builder()
                .content(limitedDtos)
                .pageNo(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalElements((long) limitedDtos.size())
                .totalPages(1)
                .isFirst(true)
                .isLast(true)
                .hasNext(false)
                .hasPrevious(false)
                .isEmpty(false)
                .build();
        }
        
        return PageUtils.toPageResponse(productPage, productDtos);
    }
    
    /**
     * Lấy sản phẩm liên quan (cùng category, khác productId)
     * 
     * Logic:
     * - Lấy product hiện tại để lấy categoryId
     * - Query products cùng categoryId, khác productId, status = IN_STOCK
     * - Giới hạn số lượng theo limit (default: 8)
     * - Dùng cho trang chi tiết sản phẩm - hiển thị "Sản phẩm liên quan"
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getRelatedProducts(Integer productId, Integer limit) {
        // Lấy product hiện tại để lấy categoryId
        Product currentProduct = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + productId));
        
        if (currentProduct.getCategory() == null) {
            // Không có category → không có sản phẩm liên quan
            return List.of();
        }
        
        Integer categoryId = currentProduct.getCategory().getIdCategory();
        
        // Tạo Pageable với limit
        int limitValue = (limit != null && limit > 0) ? limit : 8;
        Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limitValue);
        
        // Query products cùng category, khác productId, status = IN_STOCK
        List<Product> relatedProducts = productRepository.findByCategoryIdAndStatusAndIdProductNot(
            categoryId, productId, pageable
        );
        
        return productMapper.toDtoList(relatedProducts);
    }
    
    /**
     * Lấy danh sách tất cả thương hiệu (brands) - unique
     * 
     * Logic:
     * - Query distinct brands từ products có status = IN_STOCK
     * - Loại bỏ null và trống
     * - Sắp xếp theo tên thương hiệu
     * - Dùng cho dropdown/bộ lọc thương hiệu trong trang sản phẩm
     */
    @Override
    @Transactional(readOnly = true)
    public List<String> getAllBrands() {
        List<String> brands = productRepository.findDistinctBrandsByStatus();
        // Filter và sort để đảm bảo không có null hoặc empty
        return brands.stream()
            .filter(brand -> brand != null && !brand.trim().isEmpty())
            .sorted()
            .toList();
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
