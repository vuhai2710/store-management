package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.product.ProductDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    // Thêm sản phẩm mới
    ProductDTO createProduct(ProductDTO productDTO);

    // Thêm sản phẩm mới với upload ảnh
    ProductDTO createProduct(ProductDTO productDTO, MultipartFile image);

    // Sửa thông tin sản phẩm
    ProductDTO updateProduct(Integer id, ProductDTO productDTO);

    // Sửa thông tin sản phẩm với upload ảnh
    ProductDTO updateProduct(Integer id, ProductDTO productDTO, MultipartFile image);

    // Xóa sản phẩm
    void deleteProduct(Integer id);

    // Xem chi tiết sản phẩm
    ProductDTO getProductById(Integer id);

    // Tìm kiếm theo productCode (chính xác)
    ProductDTO getProductByCode(String productCode);

    // Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm)
    PageResponse<ProductDTO> getAllProductsPaginated(Pageable pageable);

    // Tìm kiếm theo name (gần đúng)
    PageResponse<ProductDTO> searchProductsByName(String name, Pageable pageable);

    // Lọc theo categoryId
    PageResponse<ProductDTO> getProductsByCategory(Integer idCategory, Pageable pageable);

    // Lọc theo brand (thương hiệu)
    PageResponse<ProductDTO> getProductsByBrand(String brand, Pageable pageable);

    // Lọc theo supplierId (nhà cung cấp) - nếu cần
    PageResponse<ProductDTO> getProductsBySupplier(Integer idSupplier, Pageable pageable);

    // Tìm kiếm và lọc kết hợp (productCode, name, categoryId, brand, price range, inventoryStatus)
    PageResponse<ProductDTO> searchProducts(String productCode, String productName,
                                           Integer idCategory, String brand,
                                           Double minPrice, Double maxPrice,
                                           String inventoryStatus,
                                           Pageable pageable);

    // Lấy top 5 sản phẩm bán chạy
    List<ProductDTO> getTop5BestSellingProducts(String orderStatus);

    // Lọc sản phẩm theo khoảng giá
    PageResponse<ProductDTO> getProductsByPriceRange(Double minPrice, Double maxPrice, Pageable pageable);

    // Lấy sản phẩm bán chạy (best sellers)
    PageResponse<ProductDTO> getBestSellingProducts(String orderStatus, Pageable pageable);

    // Lấy sản phẩm mới (sắp xếp theo createdAt DESC)
    PageResponse<ProductDTO> getNewProducts(Pageable pageable, Integer limit);

    // Lấy sản phẩm liên quan (cùng category, khác productId)
    List<ProductDTO> getRelatedProducts(Integer productId, Integer limit);

    // Lấy danh sách tất cả thương hiệu (brands) - unique
    List<String> getAllBrands();
}

