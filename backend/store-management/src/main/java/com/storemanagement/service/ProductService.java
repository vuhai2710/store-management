package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.ProductDto;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    // Thêm sản phẩm mới
    ProductDto createProduct(ProductDto productDto);

    // Sửa thông tin sản phẩm
    ProductDto updateProduct(Integer id, ProductDto productDto);

    // Xóa sản phẩm
    void deleteProduct(Integer id);

    // Xem chi tiết sản phẩm
    ProductDto getProductById(Integer id);

    // Tìm kiếm theo productCode (chính xác)
    ProductDto getProductByCode(String productCode);

    // Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm)
    PageResponse<ProductDto> getAllProductsPaginated(Pageable pageable);

    // Tìm kiếm theo name (gần đúng)
    PageResponse<ProductDto> searchProductsByName(String name, Pageable pageable);

    // Lọc theo categoryId
    PageResponse<ProductDto> getProductsByCategory(Integer idCategory, Pageable pageable);

    // Lọc theo supplierId
    PageResponse<ProductDto> getProductsBySupplier(Integer idSupplier, Pageable pageable);

    // Tìm kiếm và lọc kết hợp (productCode, name, categoryId, supplierId)
    PageResponse<ProductDto> searchProducts(String productCode, String productName,
                                           Integer idCategory, Integer idSupplier,
                                           Pageable pageable);
}

