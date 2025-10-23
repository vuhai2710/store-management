package com.storemanagement.service;

import com.storemanagement.dto.CategoryRequest;
import com.storemanagement.dto.CategoryResponse;
import com.storemanagement.entity.Category;
import com.storemanagement.exception.ResourceNotFoundException;
import com.storemanagement.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return convertToResponse(category);
    }
    
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setCategoryName(request.getCategoryName());
        
        Category savedCategory = categoryRepository.save(category);
        return convertToResponse(savedCategory);
    }
    
    @Transactional
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        category.setCategoryName(request.getCategoryName());
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToResponse(updatedCategory);
    }
    
    @Transactional
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }
    
    private CategoryResponse convertToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setIdCategory(category.getIdCategory());
        response.setCategoryName(category.getCategoryName());
        response.setCreatedAt(category.getCreatedAt());
        return response;
    }
}
