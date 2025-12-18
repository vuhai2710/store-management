package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.category.CategoryDTO;
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

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách danh mục thành công", categories));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<CategoryDTO>>> getAllCategoriesPaginated(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idCategory") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) String name) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<CategoryDTO> categoryPage;

        if (name != null && !name.trim().isEmpty()) {
            categoryPage = categoryService.searchCategoriesByName(name, pageable);
        } else {
            categoryPage = categoryService.getAllCategoriesPaginated(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách danh mục thành công", categoryPage));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(@PathVariable Integer id) {
        CategoryDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin danh mục thành công", category));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PageResponse<CategoryDTO>>> searchCategoriesByName(
            @RequestParam String name,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "idCategory") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<CategoryDTO> categoryPage = categoryService.searchCategoriesByName(name, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm danh mục thành công", categoryPage));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(@RequestBody @Valid CategoryDTO categoryDto) {
        CategoryDTO createdCategory = categoryService.createCategory(categoryDto);
        return ResponseEntity.ok(ApiResponse.success("Thêm danh mục thành công", createdCategory));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @PathVariable Integer id,
            @RequestBody @Valid CategoryDTO categoryDto) {
        CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", updatedCategory));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
    }
}
