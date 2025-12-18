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

    ProductDTO getProductById(Integer id);

    ProductDTO getProductByCode(String productCode);

    PageResponse<ProductDTO> getAllProductsPaginated(Pageable pageable);

    PageResponse<ProductDTO> searchProductsByName(String name, Pageable pageable);

    PageResponse<ProductDTO> getProductsByCategory(Integer idCategory, Pageable pageable);

    PageResponse<ProductDTO> getProductsByBrand(String brand, Pageable pageable);

    PageResponse<ProductDTO> getProductsBySupplier(Integer idSupplier, Pageable pageable);

    PageResponse<ProductDTO> searchProducts(String keyword,
            Integer idCategory, String brand,
            Double minPrice, Double maxPrice,
            String inventoryStatus,
            Pageable pageable);

    List<ProductDTO> getTop5BestSellingProducts(String orderStatus);

    PageResponse<ProductDTO> getProductsByPriceRange(Double minPrice, Double maxPrice, Pageable pageable);

    PageResponse<ProductDTO> getBestSellingProducts(String orderStatus, Pageable pageable);

    PageResponse<ProductDTO> getNewProducts(Pageable pageable, Integer limit);

    List<ProductDTO> getRelatedProducts(Integer productId, Integer limit);

    List<String> getAllBrands();

    List<ProductDTO> getProductsByIds(List<Long> productIds);
}
