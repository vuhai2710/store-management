package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.product.ProductDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    ProductDTO createProduct(ProductDTO productDTO);

    ProductDTO createProduct(ProductDTO productDTO, MultipartFile image);

    ProductDTO updateProduct(Integer id, ProductDTO productDTO);

    ProductDTO updateProduct(Integer id, ProductDTO productDTO, MultipartFile image);

    void deleteProduct(Integer id);

    ProductDTO getProductById(Integer id, Boolean showDeleted);

    ProductDTO getProductByCode(String productCode, Boolean showDeleted);

    PageResponse<ProductDTO> getAllProductsPaginated(Pageable pageable, Boolean showDeleted);

    PageResponse<ProductDTO> searchProductsByName(String name, Pageable pageable, Boolean showDeleted);

    PageResponse<ProductDTO> getProductsByCategory(Integer idCategory, Pageable pageable, Boolean showDeleted);

    PageResponse<ProductDTO> getProductsByBrand(String brand, Pageable pageable, Boolean showDeleted);

    PageResponse<ProductDTO> getProductsBySupplier(Integer idSupplier, Pageable pageable, Boolean showDeleted);

    PageResponse<ProductDTO> searchProducts(String keyword, Integer idCategory, Integer idSupplier, String brand,
            Double minPrice,
            Double maxPrice, String inventoryStatus, Boolean showDeleted, Pageable pageable);

    void restoreProduct(Integer id);

    List<ProductDTO> getTop5BestSellingProducts(String orderStatus, Boolean showDeleted);

    PageResponse<ProductDTO> getProductsByPriceRange(Double minPrice, Double maxPrice, Pageable pageable,
            Boolean showDeleted);

    PageResponse<ProductDTO> getBestSellingProducts(String orderStatus, Pageable pageable, Boolean showDeleted);

    PageResponse<ProductDTO> getNewProducts(Pageable pageable, Integer limit, Boolean showDeleted);

    List<ProductDTO> getRelatedProducts(Integer productId, Integer limit, Boolean showDeleted);

    List<String> getAllBrands(Boolean showDeleted);

    List<ProductDTO> getProductsByIds(List<Long> productIds);
}
