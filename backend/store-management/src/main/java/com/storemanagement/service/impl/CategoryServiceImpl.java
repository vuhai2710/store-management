package com.storemanagement.service.impl;

import com.storemanagement.dto.category.CategoryDTO;
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
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        log.info("Creating category: {}", categoryDTO.getCategoryName());

        if (categoryRepository.existsByCategoryName(categoryDTO.getCategoryName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại: " + categoryDTO.getCategoryName());
        }

        // Map DTO sang Entity
        Category category = categoryMapper.toEntity(categoryDTO);
        category.setCreatedAt(LocalDateTime.now());

        // Lưu vào DB
        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getIdCategory());

        return categoryMapper.toDTO(savedCategory);
    }

    @Override
    public CategoryDTO updateCategory(Integer id, CategoryDTO categoryDTO) {
        log.info("Updating category ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + id));

        if (categoryDTO.getCategoryName() != null &&
            !categoryDTO.getCategoryName().equals(category.getCategoryName())) {
            if (categoryRepository.existsByCategoryName(categoryDTO.getCategoryName())) {
                throw new RuntimeException("Tên danh mục đã tồn tại: " + categoryDTO.getCategoryName());
            }
            category.setCategoryName(categoryDTO.getCategoryName());
        }

        if (categoryDTO.getCodePrefix() != null) {
            category.setCodePrefix(categoryDTO.getCodePrefix());
        }

        // Lưu lại
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated successfully: {}", updatedCategory.getIdCategory());

        return categoryMapper.toDTO(updatedCategory);
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
    public CategoryDTO getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + id));
        return categoryMapper.toDTO(category);
    }

    @Override
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categoryMapper.toDTOList(categories);
    }

    @Override
    public PageResponse<CategoryDTO> getAllCategoriesPaginated(Pageable pageable) {
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        List<CategoryDTO> categoryDTOs = categoryMapper.toDTOList(categoryPage.getContent());
        return PageUtils.toPageResponse(categoryPage, categoryDTOs);
    }

    @Override
    public PageResponse<CategoryDTO> searchCategoriesByName(String name, Pageable pageable) {
        Page<Category> categoryPage = categoryRepository.findByCategoryNameContainingIgnoreCase(name, pageable);
        List<CategoryDTO> categoryDTOs = categoryMapper.toDTOList(categoryPage.getContent());
        return PageUtils.toPageResponse(categoryPage, categoryDTOs);
    }
}




































