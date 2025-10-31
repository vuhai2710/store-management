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
import com.storemanagement.utils.PageUtils;
import com.storemanagement.utils.ProductStatus;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductDto createProduct(ProductDto productDto) {
        // Kiểm tra productCode đã tồn tại chưa
        if (productRepository.findByProductCode(productDto.getProductCode()).isPresent()) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại: " + productDto.getProductCode());
        }

        // Kiểm tra SKU nếu có
        if (productDto.getSku() != null && !productDto.getSku().isEmpty()) {
            if (productRepository.findBySku(productDto.getSku()).isPresent()) {
                throw new RuntimeException("SKU đã tồn tại: " + productDto.getSku());
            }
        }

        // Kiểm tra category tồn tại
        Category category = categoryRepository.findById(productDto.getIdCategory())
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + productDto.getIdCategory()));

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

        // Set default values nếu cần
        if (product.getStockQuantity() == null) {
            product.setStockQuantity(0);
        }
        if (product.getStatus() == null) {
            product.setStatus(ProductStatus.IN_STOCK);
        }

        // Lưu vào DB
        Product savedProduct = productRepository.save(product);
        return productMapper.toDto(savedProduct);
    }

    @Override
    public ProductDto updateProduct(Integer id, ProductDto productDto) {
        // Tìm product theo ID
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));

        // Kiểm tra productCode nếu thay đổi
        if (productDto.getProductCode() != null && !productDto.getProductCode().equals(product.getProductCode())) {
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
        if (productDto.getIdCategory() != null && !productDto.getIdCategory().equals(product.getCategory().getIdCategory())) {
            Category category = categoryRepository.findById(productDto.getIdCategory())
                    .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + productDto.getIdCategory()));
            product.setCategory(category);
        }

        // Cập nhật supplier nếu thay đổi
        if (productDto.getIdSupplier() != null) {
            if (product.getSupplier() == null || !productDto.getIdSupplier().equals(product.getSupplier().getIdSupplier())) {
                Supplier supplier = supplierRepository.findById(productDto.getIdSupplier())
                        .orElseThrow(() -> new EntityNotFoundException("Nhà cung cấp không tồn tại với ID: " + productDto.getIdSupplier()));
                product.setSupplier(supplier);
            }
        }

        // Cập nhật các trường khác
        if (productDto.getProductName() != null) {
            product.setProductName(productDto.getProductName());
        }
        if (productDto.getDescription() != null) {
            product.setDescription(productDto.getDescription());
        }
        if (productDto.getPrice() != null) {
            product.setPrice(productDto.getPrice());
        }
        if (productDto.getStockQuantity() != null) {
            product.setStockQuantity(productDto.getStockQuantity());
        }
        if (productDto.getStatus() != null) {
            product.setStatus(productDto.getStatus());
        }
        if (productDto.getImageUrl() != null) {
            product.setImageUrl(productDto.getImageUrl());
        }
        if (productDto.getCodeType() != null) {
            product.setCodeType(productDto.getCodeType());
        }

        // Lưu lại
        Product updatedProduct = productRepository.save(product);
        return productMapper.toDto(updatedProduct);
    }

    @Override
    public void deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        productRepository.delete(product);
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
                                                   Integer idCategory, Integer idSupplier,
                                                   Pageable pageable) {
        // Normalize parameters
        String normalizedCode = (productCode == null || productCode.trim().isEmpty()) ? null : productCode.trim();
        String normalizedName = (productName == null || productName.trim().isEmpty()) ? null : productName.trim();

        Page<Product> productPage = productRepository.searchProducts(
                normalizedCode, normalizedName, idCategory, idSupplier, pageable
        );

        List<ProductDto> productDtos = productMapper.toDtoList(productPage.getContent());
        return PageUtils.toPageResponse(productPage, productDtos);
    }
}

