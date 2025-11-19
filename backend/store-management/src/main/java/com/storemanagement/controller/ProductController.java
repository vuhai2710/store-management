package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.dto.product.ProductImageDTO;
import com.storemanagement.service.ProductImageService;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;

    /**
     * Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm)
     * GET /api/v1/products
     * Params: pageNo, pageSize, sortBy, sortDirection, code, name, categoryId, brand, minPrice, maxPrice, inventoryStatus
     *
     * inventoryStatus: COMING_SOON (hàng sắp về), IN_STOCK (còn hàng), OUT_OF_STOCK (hết hàng)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getAllProducts(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String inventoryStatus) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage;

        // Nếu có bất kỳ tham số tìm kiếm/lọc nào, dùng searchProducts
        if (code != null || name != null || categoryId != null || brand != null || minPrice != null || maxPrice != null || inventoryStatus != null) {
            productPage = productService.searchProducts(code, name, categoryId, brand, minPrice, maxPrice, inventoryStatus, pageable);
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
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Integer id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sản phẩm thành công", product));
    }

    /**
     * Tìm kiếm sản phẩm theo productCode (chính xác)
     * GET /api/v1/products/code/{code}
     */
    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductByCode(@PathVariable String code) {
        ProductDTO product = productService.getProductByCode(code);
        return ResponseEntity.ok(ApiResponse.success("Tìm sản phẩm theo mã thành công", product));
    }

    /**
     * Tìm kiếm sản phẩm theo name (gần đúng)
     * GET /api/v1/products/search/name
     */
    @GetMapping("/search/name")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> searchProductsByName(
            @RequestParam String name,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.searchProductsByName(name, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm sản phẩm theo tên thành công", productPage));
    }

    /**
     * Lọc sản phẩm theo categoryId
     * GET /api/v1/products/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo danh mục thành công", productPage));
    }

    /**
     * Lọc sản phẩm theo brand (thương hiệu)
     * GET /api/v1/products/brand/{brand}
     * Authentication: Required (ADMIN, EMPLOYEE, CUSTOMER)
     */
    @GetMapping("/brand/{brand}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getProductsByBrand(
            @PathVariable String brand,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.getProductsByBrand(brand, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo thương hiệu thành công", productPage));
    }

    /**
     * Lọc sản phẩm theo supplierId (nhà cung cấp)
     * GET /api/v1/products/supplier/{supplierId}
     */
    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getProductsBySupplier(
            @PathVariable Integer supplierId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.getProductsBySupplier(supplierId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo nhà cung cấp thành công", productPage));
    }

    /**
     * Lọc sản phẩm theo khoảng giá
     * GET /api/v1/products/price?minPrice=1000000&maxPrice=5000000
     * Authentication: Required (ADMIN, EMPLOYEE, CUSTOMER)
     */
    @GetMapping("/price")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getProductsByPriceRange(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "price") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.getProductsByPriceRange(minPrice, maxPrice, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo khoảng giá thành công", productPage));
    }

    /**
     * Lấy sản phẩm bán chạy (best sellers)
     * GET /api/v1/products/best-sellers?status=COMPLETED&pageNo=1&pageSize=10
     * Authentication: Required (ADMIN, EMPLOYEE, CUSTOMER)
     */
    @GetMapping("/best-sellers")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getBestSellingProducts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {

        // Best sellers đã được sort sẵn theo số lượng bán, không cần sortBy
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);

        PageResponse<ProductDTO> productPage = productService.getBestSellingProducts(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm bán chạy thành công", productPage));
    }

    /**
     * Lấy top 5 sản phẩm bán chạy
     * GET /api/v1/products/best-sellers/top-5?status=COMPLETED
     * Authentication: Required (ADMIN, EMPLOYEE, CUSTOMER)
     */
    @GetMapping("/best-sellers/top-5")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getTop5BestSellingProducts(
            @RequestParam(required = false) String status) {

        List<ProductDTO> top5Products = productService.getTop5BestSellingProducts(status);
        return ResponseEntity.ok(ApiResponse.success("Lấy top 5 sản phẩm bán chạy thành công", top5Products));
    }

    /**
     * Lấy sản phẩm mới (sắp xếp theo createdAt DESC)
     * GET /api/v1/products/new?pageNo=1&pageSize=10&limit=20
     * Authentication: Required (ADMIN, EMPLOYEE, CUSTOMER)
     *
     * Logic: Lấy sản phẩm có status = IN_STOCK, sắp xếp theo createdAt DESC
     * Dùng cho: Trang chủ, banner "Sản phẩm mới"
     */
    @GetMapping("/new")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getNewProducts(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer limit) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ProductDTO> productPage = productService.getNewProducts(pageable, limit);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm mới thành công", productPage));
    }

    /**
     * Lấy sản phẩm liên quan (cùng category)
     * GET /api/v1/products/{id}/related?limit=8
     * Authentication: Required (ADMIN, EMPLOYEE, CUSTOMER)
     *
     * Logic: Lấy sản phẩm cùng categoryId, khác productId, status = IN_STOCK, giới hạn số lượng
     * Dùng cho: Trang chi tiết sản phẩm - hiển thị "Sản phẩm liên quan"
     */
    @GetMapping("/{id}/related")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getRelatedProducts(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "8") Integer limit) {

        List<ProductDTO> relatedProducts = productService.getRelatedProducts(id, limit);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm liên quan thành công", relatedProducts));
    }

    /**
     * Lấy danh sách tất cả thương hiệu (brands)
     * GET /api/v1/products/brands
     * Authentication: Required (ADMIN, EMPLOYEE, CUSTOMER)
     *
     * Logic: Lấy danh sách brand names unique từ products có status = IN_STOCK
     * Dùng cho: Dropdown/bộ lọc thương hiệu trong trang sản phẩm
     */
    @GetMapping("/brands")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<String>>> getAllBrands() {
        List<String> brands = productService.getAllBrands();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thương hiệu thành công", brands));
    }

    /**
     * Thêm sản phẩm mới (JSON only - không upload ảnh)
     * POST /api/v1/products
     * Content-Type: application/json
     * Body: ProductDTO (JSON object)
     *
     * Đây là cách đơn giản hơn, phù hợp với Postman và frontend React.
     * Sau khi tạo, có thể upload ảnh qua endpoint POST /api/v1/products/{id}/images
     */
    @PostMapping(consumes = {"application/json"})
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDTO>> createProductJson(@RequestBody @Valid ProductDTO productDto) {
        ProductDTO createdProduct = productService.createProduct(productDto);
        return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm thành công", createdProduct));
    }

    /**
     * Sửa thông tin sản phẩm (JSON only - không upload ảnh)
     * PUT /api/v1/products/{id}
     * Content-Type: application/json
     * Body: ProductDTO (JSON object)
     *
     * Để upload ảnh mới, sử dụng endpoint POST /api/v1/products/{id}/images
     */
    @PutMapping(value = "/{id}", consumes = {"application/json"})
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Integer id,
            @RequestBody @Valid ProductDTO productDto) {
        ProductDTO updatedProduct = productService.updateProduct(id, productDto);
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

    // ============================================================
    // PRODUCT IMAGE ENDPOINTS - Quản lý nhiều ảnh cho sản phẩm
    // ============================================================

    /**
     * Upload nhiều ảnh cho sản phẩm (tối đa 5 ảnh)
     * POST /api/v1/products/{id}/images
     * Content-Type: multipart/form-data
     * Body: images (array of files)
     *
     * Business Rules:
     * - Tối đa 5 ảnh mỗi sản phẩm
     * - Ảnh đầu tiên sẽ là ảnh chính
     */
    @PostMapping(value = "/{id}/images", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> uploadProductImages(
            @PathVariable Integer id,
            @RequestParam("images") List<MultipartFile> images) {
        List<ProductImageDTO> uploadedImages = productImageService.uploadProductImages(id, images);
        return ResponseEntity.ok(ApiResponse.success("Upload ảnh thành công", uploadedImages));
    }

    /**
     * Thêm một ảnh cho sản phẩm
     * POST /api/v1/products/{id}/images/single
     * Content-Type: multipart/form-data
     * Body: image (single file)
     */
    @PostMapping(value = "/{id}/images/single", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductImageDTO>> addProductImage(
            @PathVariable Integer id,
            @RequestParam("image") MultipartFile image) {
        ProductImageDTO addedImage = productImageService.addProductImage(id, image);
        return ResponseEntity.ok(ApiResponse.success("Thêm ảnh thành công", addedImage));
    }

    /**
     * Lấy tất cả ảnh của sản phẩm
     * GET /api/v1/products/{id}/images
     */
    @GetMapping("/{id}/images")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> getProductImages(@PathVariable Integer id) {
        List<ProductImageDTO> images = productImageService.getProductImages(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách ảnh thành công", images));
    }

    /**
     * Xóa một ảnh của sản phẩm
     * DELETE /api/v1/products/images/{imageId}
     *
     * Nếu xóa ảnh chính, ảnh tiếp theo sẽ trở thành ảnh chính
     */
    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> deleteProductImage(@PathVariable Integer imageId) {
        productImageService.deleteProductImage(imageId);
        return ResponseEntity.ok(ApiResponse.success("Xóa ảnh thành công", null));
    }

    /**
     * Đặt một ảnh làm ảnh chính
     * PUT /api/v1/products/images/{imageId}/primary
     */
    @PutMapping("/images/{imageId}/primary")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductImageDTO>> setImageAsPrimary(@PathVariable Integer imageId) {
        ProductImageDTO updatedImage = productImageService.setImageAsPrimary(imageId);
        return ResponseEntity.ok(ApiResponse.success("Đặt ảnh chính thành công", updatedImage));
    }
}

