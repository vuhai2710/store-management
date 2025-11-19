package com.storemanagement.mapper;

import com.storemanagement.dto.category.CategoryDTO;
import com.storemanagement.model.Category;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:01+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public CategoryDTO toDTO(Category entity) {
        if ( entity == null ) {
            return null;
        }

        CategoryDTO.CategoryDTOBuilder categoryDTO = CategoryDTO.builder();

        categoryDTO.idCategory( entity.getIdCategory() );
        categoryDTO.createdAt( entity.getCreatedAt() );
        categoryDTO.categoryName( entity.getCategoryName() );
        categoryDTO.codePrefix( entity.getCodePrefix() );

        return categoryDTO.build();
    }

    @Override
    public Category toEntity(CategoryDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Category.CategoryBuilder category = Category.builder();

        category.categoryName( dto.getCategoryName() );
        category.codePrefix( dto.getCodePrefix() );
        category.createdAt( dto.getCreatedAt() );

        return category.build();
    }

    @Override
    public List<CategoryDTO> toDTOList(List<Category> entities) {
        if ( entities == null ) {
            return null;
        }

        List<CategoryDTO> list = new ArrayList<CategoryDTO>( entities.size() );
        for ( Category category : entities ) {
            list.add( toDTO( category ) );
        }

        return list;
    }
}
