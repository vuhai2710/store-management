package com.storemanagement.service;

import com.storemanagement.dto.ProductRequest;
import com.storemanagement.dto.ProductResponse;
import com.storemanagement.entity.Category;
import com.storemanagement.entity.Product;
import com.storemanagement.exception.ResourceNotFoundException;
import com.storemanagement.repository.CategoryRepository;
import com.storemanagement.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return convertToResponse(product);
    }
    
    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByStatus(String status) {
        return productRepository.findByStatus(status).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(Integer threshold) {
        return productRepository.findByStockQuantityLessThan(threshold).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        
        if (request.getIdCategory() != null) {
            Category category = categoryRepository.findById(request.getIdCategory())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getIdCategory()));
            product.setCategory(category);
        }
        
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setStatus(request.getStatus() != null ? request.getStatus() : "available");
        product.setImageUrl(request.getImageUrl());
        
        Product savedProduct = productRepository.save(product);
        return convertToResponse(savedProduct);
    }
    
    @Transactional
    public ProductResponse updateProduct(Integer id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        if (request.getIdCategory() != null) {
            Category category = categoryRepository.findById(request.getIdCategory())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getIdCategory()));
            product.setCategory(category);
        }
        
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setStatus(request.getStatus());
        product.setImageUrl(request.getImageUrl());
        
        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }
    
    @Transactional
    public void deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
    }
    
    @Transactional
    public void updateStock(Integer id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setStockQuantity(product.getStockQuantity() + quantity);
        
        if (product.getStockQuantity() <= 0) {
            product.setStatus("out_of_stock");
        } else if (product.getStockQuantity() > 0 && "out_of_stock".equals(product.getStatus())) {
            product.setStatus("available");
        }
        
        productRepository.save(product);
    }
    
    private ProductResponse convertToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setIdProduct(product.getIdProduct());
        response.setProductName(product.getProductName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStockQuantity(product.getStockQuantity());
        response.setStatus(product.getStatus());
        response.setImageUrl(product.getImageUrl());
        response.setCreatedAt(product.getCreatedAt());
        
        if (product.getCategory() != null) {
            response.setIdCategory(product.getCategory().getIdCategory());
            response.setCategoryName(product.getCategory().getCategoryName());
        }
        
        return response;
    }
}
