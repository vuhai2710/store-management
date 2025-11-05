package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.ProductDto;
import com.storemanagement.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm)
     * GET /api/v1/products
     * Params: pageNo, pageSize, sortBy, sortDirection, code, name, categoryId, brand, minPrice, maxPrice
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getAllProducts(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDto> productPage;

        // Nếu có bất kỳ tham số tìm kiếm/lọc nào, dùng searchProducts
        if (code != null || name != null || categoryId != null || brand != null || minPrice != null || maxPrice != null) {
            productPage = productService.searchProducts(code, name, categoryId, brand, minPrice, maxPrice, pageable);
        } else {
            productPage = productService.getAllProductsPaginated(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", productPage));
    }

    /**
     * Xem chi tiết sản phẩm theo ID
     * GET /api/v1/products/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Integer id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sản phẩm thành công", product));
    }

    /**
     * Tìm kiếm sản phẩm theo productCode (chính xác)
     * GET /api/v1/products/code/{code}
     */
    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDto>> getProductByCode(@PathVariable String code) {
        ProductDto product = productService.getProductByCode(code);
        return ResponseEntity.ok(ApiResponse.success("Tìm sản phẩm theo mã thành công", product));
    }

    /**
     * Tìm kiếm sản phẩm theo name (gần đúng)
     * GET /api/v1/products/search/name
     */
    @GetMapping("/search/name")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> searchProductsByName(
            @RequestParam String name,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDto> productPage = productService.searchProductsByName(name, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm sản phẩm theo tên thành công", productPage));
    }

    /**
     * Lọc sản phẩm theo categoryId
     * GET /api/v1/products/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDto> productPage = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo danh mục thành công", productPage));
    }

    /**
     * Lọc sản phẩm theo brand (thương hiệu)
     * GET /api/v1/products/brand/{brand}
     */
    @GetMapping("/brand/{brand}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProductsByBrand(
            @PathVariable String brand,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDto> productPage = productService.getProductsByBrand(brand, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo thương hiệu thành công", productPage));
    }
    
    /**
     * Lọc sản phẩm theo supplierId (nhà cung cấp)
     * GET /api/v1/products/supplier/{supplierId}
     */
    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProductsBySupplier(
            @PathVariable Integer supplierId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDto> productPage = productService.getProductsBySupplier(supplierId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo nhà cung cấp thành công", productPage));
    }

    /**
     * Lọc sản phẩm theo khoảng giá
     * GET /api/v1/products/price?minPrice=1000000&maxPrice=5000000
     */
    @GetMapping("/price")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProductsByPriceRange(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "price") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDto> productPage = productService.getProductsByPriceRange(minPrice, maxPrice, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo khoảng giá thành công", productPage));
    }

    /**
     * Lấy sản phẩm bán chạy (best sellers)
     * GET /api/v1/products/best-sellers?status=COMPLETED&pageNo=1&pageSize=10
     */
    @GetMapping("/best-sellers")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getBestSellingProducts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {

        // Best sellers đã được sort sẵn theo số lượng bán, không cần sortBy
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);

        PageResponse<ProductDto> productPage = productService.getBestSellingProducts(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm bán chạy thành công", productPage));
    }

    /**
     * Thêm sản phẩm mới
     * POST /api/v1/products
     * Content-Type: multipart/form-data
     * Body: productDto (JSON string) và image (file, optional)
     */
    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @RequestPart("productDto") @Valid ProductDto productDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        ProductDto createdProduct = productService.createProduct(productDto, image);
        return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm thành công", createdProduct));
    }

    /**
     * Sửa thông tin sản phẩm
     * PUT /api/v1/products/{id}
     * Content-Type: multipart/form-data
     * Body: productDto (JSON string) và image (file, optional)
     */
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Integer id,
            @RequestPart("productDto") @Valid ProductDto productDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        ProductDto updatedProduct = productService.updateProduct(id, productDto, image);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", updatedProduct));
    }

    /**
     * Xóa sản phẩm
     * DELETE /api/v1/products/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }
}

