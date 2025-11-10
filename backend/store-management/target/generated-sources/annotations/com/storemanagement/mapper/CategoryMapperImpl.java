package com.storemanagement.mapper;

import com.storemanagement.dto.response.CategoryDto;
import com.storemanagement.model.Category;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public CategoryDto toDto(Category entity) {
        if ( entity == null ) {
            return null;
        }

        CategoryDto.CategoryDtoBuilder categoryDto = CategoryDto.builder();

        categoryDto.categoryName( entity.getCategoryName() );
        categoryDto.codePrefix( entity.getCodePrefix() );
        categoryDto.createdAt( entity.getCreatedAt() );
        categoryDto.idCategory( entity.getIdCategory() );

        return categoryDto.build();
    }

    @Override
    public Category toEntity(CategoryDto dto) {
        if ( dto == null ) {
            return null;
        }

        Category.CategoryBuilder category = Category.builder();

        category.categoryName( dto.getCategoryName() );
        category.codePrefix( dto.getCodePrefix() );
        category.createdAt( dto.getCreatedAt() );
        category.idCategory( dto.getIdCategory() );

        return category.build();
    }

    @Override
    public List<CategoryDto> toDtoList(List<Category> entities) {
        if ( entities == null ) {
            return null;
        }

        List<CategoryDto> list = new ArrayList<CategoryDto>( entities.size() );
        for ( Category category : entities ) {
            list.add( toDto( category ) );
        }

        return list;
    }
}
