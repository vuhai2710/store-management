package com.storemanagement.mapper;

import com.storemanagement.dto.category.CategoryDTO;
import com.storemanagement.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "idCategory", source = "idCategory")
    @Mapping(target = "createdAt", source = "createdAt")
    CategoryDTO toDTO(Category entity);

    @Mapping(target = "idCategory", ignore = true)
    Category toEntity(CategoryDTO dto);

    List<CategoryDTO> toDTOList(List<Category> entities);
}
