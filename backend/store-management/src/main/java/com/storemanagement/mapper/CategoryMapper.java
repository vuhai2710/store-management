package com.storemanagement.mapper;

import com.storemanagement.dto.CategoryDto;
import com.storemanagement.model.Category;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    // Category → CategoryDto
    CategoryDto toDto(Category entity);

    // CategoryDto → Category
    Category toEntity(CategoryDto dto);

    // List mapping
    List<CategoryDto> toDtoList(List<Category> entities);
}





























