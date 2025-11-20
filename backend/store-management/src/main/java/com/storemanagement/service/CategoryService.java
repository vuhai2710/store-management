package com.storemanagement.service;

import com.storemanagement.dto.category.CategoryDTO;
import com.storemanagement.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {

    CategoryDTO createCategory(CategoryDTO categoryDTO);
    CategoryDTO updateCategory(Integer id, CategoryDTO categoryDTO);
    void deleteCategory(Integer id);
    CategoryDTO getCategoryById(Integer id);
    List<CategoryDTO> getAllCategories();
    PageResponse<CategoryDTO> getAllCategoriesPaginated(Pageable pageable);
    PageResponse<CategoryDTO> searchCategoriesByName(String name, Pageable pageable);
}