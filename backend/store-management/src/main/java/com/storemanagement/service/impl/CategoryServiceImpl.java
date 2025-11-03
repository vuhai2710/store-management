package com.storemanagement.service.impl;

import com.storemanagement.dto.CategoryDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.mapper.CategoryMapper;
import com.storemanagement.model.Category;
import com.storemanagement.repository.CategoryRepository;
import com.storemanagement.service.CategoryService;
import com.storemanagement.utils.PageUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {
        log.info("Creating category: {}", categoryDto.getCategoryName());

        if (categoryRepository.existsByCategoryName(categoryDto.getCategoryName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại: " + categoryDto.getCategoryName());
        }

        // Map DTO sang Entity
        Category category = categoryMapper.toEntity(categoryDto);
        category.setCreatedAt(LocalDateTime.now());

        // Lưu vào DB
        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getIdCategory());

        return categoryMapper.toDto(savedCategory);
    }

    @Override
    public CategoryDto updateCategory(Integer id, CategoryDto categoryDto) {
        log.info("Updating category ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + id));

        if (categoryDto.getCategoryName() != null &&
            !categoryDto.getCategoryName().equals(category.getCategoryName())) {
            if (categoryRepository.existsByCategoryName(categoryDto.getCategoryName())) {
                throw new RuntimeException("Tên danh mục đã tồn tại: " + categoryDto.getCategoryName());
            }
            category.setCategoryName(categoryDto.getCategoryName());
        }

        if (categoryDto.getCodePrefix() != null) {
            category.setCodePrefix(categoryDto.getCodePrefix());
        }

        // Lưu lại
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated successfully: {}", updatedCategory.getIdCategory());

        return categoryMapper.toDto(updatedCategory);
    }

    @Override
    public void deleteCategory(Integer id) {
        log.info("Deleting category ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + id));

        categoryRepository.delete(category);
        log.info("Category deleted successfully: {}", id);
    }

    @Override
    public CategoryDto getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + id));
        return categoryMapper.toDto(category);
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categoryMapper.toDtoList(categories);
    }

    @Override
    public PageResponse<CategoryDto> getAllCategoriesPaginated(Pageable pageable) {
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        List<CategoryDto> categoryDtos = categoryMapper.toDtoList(categoryPage.getContent());
        return PageUtils.toPageResponse(categoryPage, categoryDtos);
    }

    @Override
    public PageResponse<CategoryDto> searchCategoriesByName(String name, Pageable pageable) {
        Page<Category> categoryPage = categoryRepository.findByCategoryNameContainingIgnoreCase(name, pageable);
        List<CategoryDto> categoryDtos = categoryMapper.toDtoList(categoryPage.getContent());
        return PageUtils.toPageResponse(categoryPage, categoryDtos);
    }
}









