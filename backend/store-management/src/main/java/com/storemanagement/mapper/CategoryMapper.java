package com.storemanagement.mapper;

import com.storemanagement.dto.category.CategoryDTO;
import com.storemanagement.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    // Category → CategoryDTO
    @Mapping(target = "idCategory", source = "idCategory")
    @Mapping(target = "createdAt", source = "createdAt")
    CategoryDTO toDTO(Category entity);

    // CategoryDTO → Category (for create/update)
    @Mapping(target = "idCategory", ignore = true)
    // createdAt and updatedAt are inherited from BaseEntity and managed by JPA/Hibernate
    Category toEntity(CategoryDTO dto);

    // List mapping
    List<CategoryDTO> toDTOList(List<Category> entities);
}




































