package com.storemanagement.mapper;

import com.storemanagement.dto.response.ProductImageDto;
import com.storemanagement.model.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper cho ProductImage entity <-> ProductImageDto
 */
@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    
    @Mapping(source = "product.idProduct", target = "idProduct")
    ProductImageDto toDto(ProductImage productImage);
    
    List<ProductImageDto> toDtoList(List<ProductImage> productImages);
}










