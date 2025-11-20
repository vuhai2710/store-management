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
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + productDto.getIdCategory()));

        String productCode = productDto.getProductCode();
        String sku = productDto.getSku();

        if (productDto.getCodeType() == CodeType.SKU) {
            if (productCode == null || productCode.trim().isEmpty()) {

                sku = generateUniqueSku(category);
                productCode = sku; // productCode = SKU trong trường hợp này
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
        product.setDescription(productDto.getDescription());
        // imageUrl đã được set trong productDto ở bước upload ảnh (nếu có)
        if (productDto.getImageUrl() != null) {
            product.setImageUrl(productDto.getImageUrl());
        }

        product.setStockQuantity(0);
        product.setStatus(ProductStatus.OUT_OF_STOCK);

        log.info("New product will be created with stockQuantity=0 and status=OUT_OF_STOCK. " +
                "Use ImportOrder to add stock to inventory.");

        // Lưu vào DB
        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}, Stock: {}, Status: {}",
                savedProduct.getIdProduct(), savedProduct.getStockQuantity(), savedProduct.getStatus());

        // Fetch lại với JOIN FETCH để có đầy đủ thông tin category và supplier
        Product productWithDetails = productRepository.findByIdWithDetails(savedProduct.getIdProduct())
                .orElse(savedProduct);

        return productMapper.toDTO(productWithDetails);
    }

    @Override
    public ProductDTO updateProduct(Integer id, ProductDTO productDto) {
        return updateProduct(id, productDto, null);
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
                    .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + productDto.getIdCategory()));
            product.setCategory(category);
        }

        if (productDto.getIdSupplier() != null) {
            if (product.getSupplier() == null ||
                !productDto.getIdSupplier().equals(product.getSupplier().getIdSupplier())) {
                Supplier supplier = supplierRepository.findById(productDto.getIdSupplier())
                        .orElseThrow(() -> new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + productDto.getIdSupplier()));
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

        if (productDto.getStockQuantity() != null &&
            !productDto.getStockQuantity().equals(product.getStockQuantity())) {
            log.warn("Attempted to update stockQuantity from DTO (productId={}, oldStock={}, attemptedStock={}). " +
                    "This operation is ignored. Use ImportOrder or InventoryTransaction to update stock.",
                    id, product.getStockQuantity(), productDto.getStockQuantity());
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
    public void deleteProduct(Integer id) {
        log.info("Deleting product ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));

        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            try {
                fileStorageService.deleteImage(product.getImageUrl());
                log.info("Deleted product image: {}", product.getImageUrl());
            } catch (Exception e) {
                log.warn("Error deleting product image: {}", e.getMessage());
            }
        }

        productRepository.delete(product);
        log.info("Product deleted successfully: {}", id);
    }

    @Override
    public ProductDTO getProductById(Integer id) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        return productMapper.toDTO(product);
    }

    @Override
    public ProductDTO getProductByCode(String productCode) {
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với mã: " + productCode));
        Product productWithDetails = productRepository.findByIdWithDetails(product.getIdProduct())
                .orElse(product);
        return productMapper.toDTO(productWithDetails);
    }

    @Override
    public PageResponse<ProductDTO> getAllProductsPaginated(Pageable pageable) {
        Page<Product> productPage = productRepository.findAll(pageable);
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> searchProductsByName(String name, Pageable pageable) {
        Page<Product> productPage = productRepository.findByProductNameContainingIgnoreCase(name, pageable);
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> getProductsByCategory(Integer idCategory, Pageable pageable) {
        if (!categoryRepository.existsById(idCategory)) {
            throw new EntityNotFoundException("Danh mục không tồn tại với ID: " + idCategory);
        }

        Page<Product> productPage = productRepository.findByCategory_IdCategory(idCategory, pageable);
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> getProductsByBrand(String brand, Pageable pageable) {
        if (brand == null || brand.trim().isEmpty()) {
            throw new RuntimeException("Thương hiệu không được để trống");
        }

        Page<Product> productPage = productRepository.findByBrandIgnoreCase(brand.trim(), pageable);
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> getProductsBySupplier(Integer idSupplier, Pageable pageable) {
        if (!supplierRepository.existsById(idSupplier)) {
            throw new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + idSupplier);
        }

        Page<Product> productPage = productRepository.findBySupplier_IdSupplier(idSupplier, pageable);
        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> searchProducts(String productCode, String productName,
                                                   Integer idCategory, String brand,
                                                   Double minPrice, Double maxPrice,
                                                   String inventoryStatus,
                                                   Pageable pageable) {
        String normalizedCode = (productCode == null || productCode.trim().isEmpty()) ? null : productCode.trim();
        String normalizedName = (productName == null || productName.trim().isEmpty()) ? null : productName.trim();
        String normalizedBrand = (brand == null || brand.trim().isEmpty()) ? null : brand.trim();
        String normalizedInventoryStatus = (inventoryStatus == null || inventoryStatus.trim().isEmpty()) ? null : inventoryStatus.trim();

        if (normalizedInventoryStatus != null) {
            try {
                com.storemanagement.utils.InventoryStatusFilter.valueOf(normalizedInventoryStatus);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Trạng thái tồn kho không hợp lệ. Chấp nhận: COMING_SOON, IN_STOCK, OUT_OF_STOCK");
            }
        }

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
            normalizedCode, normalizedName, idCategory, normalizedBrand, minPrice, maxPrice, normalizedInventoryStatus, pageable
        );

        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    public PageResponse<ProductDTO> getProductsByPriceRange(Double minPrice, Double maxPrice, Pageable pageable) {
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
            null, null, null, null, minPrice, maxPrice, null, pageable
        );

        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getTop5BestSellingProducts(String orderStatus) {
        String normalizedStatus = (orderStatus == null || orderStatus.trim().isEmpty()) ? null : orderStatus.trim();

        List<Object[]> bestSellingData = productRepository.findBestSellingProductIds(
            normalizedStatus, 5, 0
        );

        if (bestSellingData.isEmpty()) {
            return List.of();
        }

        List<Integer> productIds = bestSellingData.stream()
            .map(row -> ((Number) row[0]).intValue())
            .toList();

        List<Product> allProducts = productRepository.findAllById(productIds);

        java.util.Map<Integer, Product> productMap = allProducts.stream()
            .collect(java.util.stream.Collectors.toMap(Product::getIdProduct, p -> p));

        List<Product> products = productIds.stream()
            .map(productMap::get)
            .filter(java.util.Objects::nonNull)
            .toList();

        products.forEach(p -> {
            if (p.getCategory() != null) {
                p.getCategory().getCategoryName(); // Trigger lazy load
            }
            if (p.getSupplier() != null) {
                p.getSupplier().getSupplierName(); // Trigger lazy load
            }
        });

        return productMapper.toDTOList(products);
    }

    @Override
    public PageResponse<ProductDTO> getBestSellingProducts(String orderStatus, Pageable pageable) {

        String normalizedStatus = (orderStatus == null || orderStatus.trim().isEmpty()) ? null : orderStatus.trim();

        int pageNo = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int offset = pageNo * pageSize;

        List<Object[]> bestSellingData = productRepository.findBestSellingProductIds(
            normalizedStatus, pageSize, offset
        );

        if (bestSellingData.isEmpty()) {
            // Không có sản phẩm nào đã bán
            return PageResponse.<ProductDTO>builder()
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

        List<Integer> productIds = bestSellingData.stream()
            .map(row -> ((Number) row[0]).intValue())
            .toList();

        List<Product> allProducts = productRepository.findAllById(productIds);

        java.util.Map<Integer, Product> productMap = allProducts.stream()
            .collect(java.util.stream.Collectors.toMap(Product::getIdProduct, p -> p));

        List<Product> products = productIds.stream()
            .map(productMap::get)
            .filter(java.util.Objects::nonNull)
            .toList();

        products.forEach(p -> {
            if (p.getCategory() != null) {
                p.getCategory().getCategoryName();
            }
            if (p.getSupplier() != null) {
                p.getSupplier().getSupplierName();
            }
        });

        List<ProductDTO> productDtos = productMapper.toDTOList(products);

        Long totalElements = productRepository.countBestSellingProducts(normalizedStatus);
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);

        return PageResponse.<ProductDTO>builder()
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

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductDTO> getNewProducts(Pageable pageable, Integer limit) {
        // Nếu có limit, tạo Pageable mới với limit làm pageSize
        Pageable queryPageable = pageable;
        if (limit != null && limit > 0) {
            queryPageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                Math.min(limit, pageable.getPageSize()),
                pageable.getSort()
            );
        }

        Page<Product> productPage = productRepository.findNewProductsByStatus(queryPageable);

        List<ProductDTO> productDtos = productMapper.toDTOList(productPage.getContent());

        if (limit != null && limit > 0 && productDtos.size() > limit) {
            List<ProductDTO> limitedDtos = productDtos.subList(0, limit);
            return PageResponse.<ProductDTO>builder()
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

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getRelatedProducts(Integer productId, Integer limit) {
        Product currentProduct = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + productId));

        if (currentProduct.getCategory() == null) {
            return List.of();
        }

        Integer categoryId = currentProduct.getCategory().getIdCategory();

        int limitValue = (limit != null && limit > 0) ? limit : 8;
        Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limitValue);

        List<Product> relatedProducts = productRepository.findByCategoryIdAndStatusAndIdProductNot(
            categoryId, productId, pageable
        );

        return productMapper.toDTOList(relatedProducts);
    }

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

    private String generateUniqueSku(Category category) {
        int maxRetries = 5;
        int attempt = 0;

        while (attempt < maxRetries) {
            String sku = SkuGenerator.generateSku(category);

            if (productRepository.findBySku(sku).isEmpty()) {
                return sku;
            }

            attempt++;
            log.warn("SKU collision detected: {}, retrying... (attempt {}/{})", sku, attempt, maxRetries);

            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        throw new RuntimeException("Không thể sinh SKU sau " + maxRetries + " lần thử");
    }
}
