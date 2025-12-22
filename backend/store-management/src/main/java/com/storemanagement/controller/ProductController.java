package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.dto.product.ProductImageDTO;
import com.storemanagement.dto.product.ProductOnSaleDTO;
import com.storemanagement.service.ProductImageService;
import com.storemanagement.service.ProductService;
import com.storemanagement.service.ProductViewService;
import com.storemanagement.service.PromotionService;
import com.storemanagement.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;
    private final ProductViewService productViewService;
    private final PromotionService promotionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getAllProducts(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String inventoryStatus,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage;

        String normalizedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String normalizedBrand = (brand != null && !brand.trim().isEmpty()) ? brand.trim() : null;

        if (normalizedKeyword != null || categoryId != null || normalizedBrand != null || minPrice != null
                || maxPrice != null || inventoryStatus != null || showDeleted) {
            productPage = productService.searchProducts(normalizedKeyword, categoryId, null, normalizedBrand, minPrice,
                    maxPrice, inventoryStatus, showDeleted, pageable);
        } else {
            productPage = productService.getAllProductsPaginated(pageable, showDeleted);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", productPage));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted,
            HttpServletRequest request) {
        ProductDTO product = productService.getProductById(id, showDeleted);

        try {
            Integer userId = SecurityUtils.getCurrentUserId().orElse(null);
            String sessionId = request.getSession().getId();
            log.info("Attempting to log product view: userId={}, sessionId={}, productId={}", userId, sessionId, id);
            productViewService.logView(userId, sessionId, id);
        } catch (Exception e) {
            log.error("Failed to log product view for productId: {}, userId: {}, error: {}",
                    id, SecurityUtils.getCurrentUserId().orElse(null), e.getMessage(), e);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sản phẩm thành công", product));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductByCode(
            @PathVariable String code,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {
        ProductDTO product = productService.getProductByCode(code, showDeleted);
        return ResponseEntity.ok(ApiResponse.success("Tìm sản phẩm theo mã thành công", product));
    }

    @GetMapping("/search/name")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> searchProductsByName(
            @RequestParam String name,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.searchProductsByName(name, pageable, showDeleted);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm sản phẩm theo tên thành công", productPage));
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.getProductsByCategory(categoryId, pageable, showDeleted);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo danh mục thành công", productPage));
    }

    @GetMapping("/brand/{brand}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getProductsByBrand(
            @PathVariable String brand,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.getProductsByBrand(brand, pageable, showDeleted);
        return ResponseEntity
                .ok(ApiResponse.success("Lấy danh sách sản phẩm theo thương hiệu thành công", productPage));
    }

    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getProductsBySupplier(
            @PathVariable Integer supplierId,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idProduct") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.getProductsBySupplier(supplierId, pageable, showDeleted);
        return ResponseEntity
                .ok(ApiResponse.success("Lấy danh sách sản phẩm theo nhà cung cấp thành công", productPage));
    }

    @GetMapping("/price")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getProductsByPriceRange(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "price") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<ProductDTO> productPage = productService.getProductsByPriceRange(minPrice, maxPrice, pageable,
                showDeleted);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm theo khoảng giá thành công", productPage));
    }

    @GetMapping("/best-sellers")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getBestSellingProducts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);

        PageResponse<ProductDTO> productPage = productService.getBestSellingProducts(status, pageable, showDeleted);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm bán chạy thành công", productPage));
    }

    @GetMapping("/best-sellers/top-5")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getTop5BestSellingProducts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        List<ProductDTO> top5Products = productService.getTop5BestSellingProducts(status, showDeleted);
        return ResponseEntity.ok(ApiResponse.success("Lấy top 5 sản phẩm bán chạy thành công", top5Products));
    }

    @GetMapping("/new")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> getNewProducts(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ProductDTO> productPage = productService.getNewProducts(pageable, limit, showDeleted);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm mới thành công", productPage));
    }

    @GetMapping("/on-sale")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductOnSaleDTO>>> getProductsOnSale() {
        List<ProductOnSaleDTO> productsOnSale = promotionService.getProductsOnSale();
        return ResponseEntity
                .ok(ApiResponse.success("Lấy danh sách sản phẩm đang giảm giá thành công", productsOnSale));
    }

    @GetMapping("/{id}/related")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getRelatedProducts(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "8") Integer limit,
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {

        List<ProductDTO> relatedProducts = productService.getRelatedProducts(id, limit, showDeleted);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm liên quan thành công", relatedProducts));
    }

    @GetMapping("/brands")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<String>>> getAllBrands(
            @RequestParam(required = false, defaultValue = "false") Boolean showDeleted) {
        List<String> brands = productService.getAllBrands(showDeleted);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thương hiệu thành công", brands));
    }

    @PostMapping(consumes = { "application/json" })
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDTO>> createProductJson(@RequestBody @Valid ProductDTO productDto) {
        ProductDTO createdProduct = productService.createProduct(productDto);
        return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm thành công", createdProduct));
    }

    @PutMapping(value = "/{id}", consumes = { "application/json" })
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Integer id,
            @RequestBody @Valid ProductDTO productDto) {
        ProductDTO updatedProduct = productService.updateProduct(id, productDto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", updatedProduct));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> restoreProduct(@PathVariable Integer id) {
        productService.restoreProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Khôi phục sản phẩm thành công", null));
    }

    @PostMapping(value = "/{id}/images", consumes = { "multipart/form-data" })
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> uploadProductImages(
            @PathVariable Integer id,
            @RequestParam("images") List<MultipartFile> images) {
        List<ProductImageDTO> uploadedImages = productImageService.uploadProductImages(id, images);
        return ResponseEntity.ok(ApiResponse.success("Upload ảnh thành công", uploadedImages));
    }

    @PostMapping(value = "/{id}/images/single", consumes = { "multipart/form-data" })
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductImageDTO>> addProductImage(
            @PathVariable Integer id,
            @RequestParam("image") MultipartFile image) {
        ProductImageDTO addedImage = productImageService.addProductImage(id, image);
        return ResponseEntity.ok(ApiResponse.success("Thêm ảnh thành công", addedImage));
    }

    @GetMapping("/{id}/images")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> getProductImages(@PathVariable Integer id) {
        List<ProductImageDTO> images = productImageService.getProductImages(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách ảnh thành công", images));
    }

    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> deleteProductImage(@PathVariable Integer imageId) {
        productImageService.deleteProductImage(imageId);
        return ResponseEntity.ok(ApiResponse.success("Xóa ảnh thành công", null));
    }

    @PutMapping("/images/{imageId}/primary")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductImageDTO>> setImageAsPrimary(@PathVariable Integer imageId) {
        ProductImageDTO updatedImage = productImageService.setImageAsPrimary(imageId);
        return ResponseEntity.ok(ApiResponse.success("Đặt ảnh chính thành công", updatedImage));
    }
}
