package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.CategoryDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến Danh mục sản phẩm (Category)
 * Base URL: /api/v1/categories
 * 
 * Tất cả các endpoint yêu cầu authentication với role ADMIN hoặc EMPLOYEE
 * Header: Authorization: Bearer {JWT_TOKEN}
 * 
 * @author Store Management Team
 */
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Lấy tất cả danh mục (không phân trang)
     * 
     * Endpoint: GET /api/v1/categories/all
     * Authentication: Required (ADMIN hoặc EMPLOYEE)
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Lấy danh sách danh mục thành công",
     *   "data": [ { CategoryDto }, ... ]
     * }
     * 
     * @return ApiResponse chứa danh sách tất cả categories
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách danh mục thành công", categories));
    }

    /**
     * Lấy danh sách danh mục có phân trang (có thể tìm kiếm theo tên)
     * 
     * Endpoint: GET /api/v1/categories
     * Authentication: Required (ADMIN hoặc EMPLOYEE)
     * 
     * Query Parameters:
     * - pageNo: số trang (default: 1)
     * - pageSize: số lượng item/trang (default: 10)
     * - sortBy: trường sắp xếp (default: "idCategory")
     * - sortDirection: ASC hoặc DESC (default: "ASC")
     * - name: tên danh mục để tìm kiếm (optional)
     * 
     * Example: GET /api/v1/categories?pageNo=1&pageSize=10&sortBy=name&sortDirection=ASC&name=Điện
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Lấy danh sách danh mục thành công",
     *   "data": {
     *     "content": [ { CategoryDto }, ... ],
     *     "pageNo": 1,
     *     "pageSize": 10,
     *     "totalElements": 50,
     *     "totalPages": 5,
     *     "isFirst": true,
     *     "isLast": false,
     *     "hasNext": true,
     *     "hasPrevious": false,
     *     "isEmpty": false
     *   }
     * }
     * 
     * @param pageNo số trang (bắt đầu từ 1)
     * @param pageSize số lượng item mỗi trang
     * @param sortBy trường sắp xếp
     * @param sortDirection hướng sắp xếp (ASC/DESC)
     * @param name tên danh mục để tìm kiếm (optional)
     * @return ApiResponse chứa PageResponse với danh sách categories
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<CategoryDto>>> getAllCategoriesPaginated(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idCategory") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) String name) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<CategoryDto> categoryPage;

        if (name != null && !name.trim().isEmpty()) {
            categoryPage = categoryService.searchCategoriesByName(name, pageable);
        } else {
            categoryPage = categoryService.getAllCategoriesPaginated(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách danh mục thành công", categoryPage));
    }

    /**
     * Lấy thông tin chi tiết một danh mục theo ID
     * 
     * Endpoint: GET /api/v1/categories/{id}
     * Authentication: Required (ADMIN hoặc EMPLOYEE)
     * 
     * Path Parameters:
     * - id: ID của category (integer)
     * 
     * Example: GET /api/v1/categories/1
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Lấy thông tin danh mục thành công",
     *   "data": { CategoryDto object }
     * }
     * 
     * @param id ID của category
     * @return ApiResponse chứa CategoryDto
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable Integer id) {
        CategoryDto category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin danh mục thành công", category));
    }

    /**
     * Tìm kiếm danh mục theo tên (có phân trang)
     * 
     * Endpoint: GET /api/v1/categories/search?name={name}
     * Authentication: Required (ADMIN hoặc EMPLOYEE)
     * 
     * Query Parameters:
     * - name: tên danh mục để tìm kiếm (required)
     * - pageNo: số trang (default: 1)
     * - pageSize: số lượng item/trang (default: 10)
     * - sortBy: trường sắp xếp (default: "idCategory")
     * - sortDirection: ASC hoặc DESC (default: "ASC")
     * 
     * Example: GET /api/v1/categories/search?name=Điện&pageNo=1&pageSize=10
     * 
     * Response: Giống như getAllCategoriesPaginated
     * 
     * @param name tên danh mục để tìm kiếm
     * @param pageNo số trang
     * @param pageSize số lượng item mỗi trang
     * @param sortBy trường sắp xếp
     * @param sortDirection hướng sắp xếp
     * @return ApiResponse chứa PageResponse với danh sách categories tìm được
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<CategoryDto>>> searchCategoriesByName(
            @RequestParam String name,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idCategory") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<CategoryDto> categoryPage = categoryService.searchCategoriesByName(name, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm danh mục thành công", categoryPage));
    }

    /**
     * Tạo danh mục mới
     * 
     * Endpoint: POST /api/v1/categories
     * Authentication: Required (ADMIN hoặc EMPLOYEE)
     * 
     * Request Body (JSON):
     * {
     *   "name": "string (required)",
     *   "description": "string (optional)"
     * }
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Thêm danh mục thành công",
     *   "data": { CategoryDto object với idCategory đã được tạo }
     * }
     * 
     * @param categoryDto CategoryDto chứa thông tin danh mục mới
     * @return ApiResponse chứa CategoryDto đã được tạo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@RequestBody @Valid CategoryDto categoryDto) {
        CategoryDto createdCategory = categoryService.createCategory(categoryDto);
        return ResponseEntity.ok(ApiResponse.success("Thêm danh mục thành công", createdCategory));
    }

    /**
     * Cập nhật thông tin danh mục
     * 
     * Endpoint: PUT /api/v1/categories/{id}
     * Authentication: Required (ADMIN hoặc EMPLOYEE)
     * 
     * Path Parameters:
     * - id: ID của category cần cập nhật
     * 
     * Request Body (JSON):
     * {
     *   "name": "string (required)",
     *   "description": "string (optional)"
     * }
     * 
     * Example: PUT /api/v1/categories/1
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Cập nhật danh mục thành công",
     *   "data": { CategoryDto object đã được cập nhật }
     * }
     * 
     * @param id ID của category cần cập nhật
     * @param categoryDto CategoryDto chứa thông tin mới
     * @return ApiResponse chứa CategoryDto đã được cập nhật
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Integer id,
            @RequestBody @Valid CategoryDto categoryDto) {
        CategoryDto updatedCategory = categoryService.updateCategory(id, categoryDto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", updatedCategory));
    }

    /**
     * Xóa danh mục
     * 
     * Endpoint: DELETE /api/v1/categories/{id}
     * Authentication: Required (chỉ ADMIN)
     * 
     * Path Parameters:
     * - id: ID của category cần xóa
     * 
     * Example: DELETE /api/v1/categories/1
     * 
     * Response:
     * {
     *   "code": 200,
     *   "message": "Xóa danh mục thành công",
     *   "data": null
     * }
     * 
     * Lưu ý: Chỉ ADMIN mới có quyền xóa danh mục
     * 
     * @param id ID của category cần xóa
     * @return ApiResponse với message thành công
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
    }
}


























