package com.storemanagement.service;

import com.storemanagement.dto.CategoryDto;
import com.storemanagement.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {

    CategoryDto createCategory(CategoryDto categoryDto);
    CategoryDto updateCategory(Integer id, CategoryDto categoryDto);
    void deleteCategory(Integer id);
    CategoryDto getCategoryById(Integer id);
    List<CategoryDto> getAllCategories();
    PageResponse<CategoryDto> getAllCategoriesPaginated(Pageable pageable);
    PageResponse<CategoryDto> searchCategoriesByName(String name, Pageable pageable);
}






























