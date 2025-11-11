package com.storemanagement.mapper;

import com.storemanagement.dto.product.ProductImageDTO;
import com.storemanagement.model.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper cho ProductImage entity <-> ProductImageDTO
 */
@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    
    // ProductImage → ProductImageDTO
    @Mapping(target = "idProductImage", source = "idProductImage")
    @Mapping(source = "product.idProduct", target = "idProduct")
    @Mapping(target = "createdAt", source = "createdAt")
    ProductImageDTO toDTO(ProductImage productImage);
    
    List<ProductImageDTO> toDTOList(List<ProductImage> productImages);

    // ProductImageDTO → ProductImage (for create/update)
    @Mapping(target = "idProductImage", ignore = true)
    @Mapping(target = "product", ignore = true)
    // createdAt is inherited from BaseEntity and managed by JPA/Hibernate
    ProductImage toEntity(ProductImageDTO dto);
}










