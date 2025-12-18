package com.storemanagement.mapper;

import com.storemanagement.dto.product.ProductImageDTO;
import com.storemanagement.model.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {

    @Mapping(target = "idProductImage", source = "idProductImage")
    @Mapping(source = "product.idProduct", target = "idProduct")
    @Mapping(target = "createdAt", source = "createdAt")
    ProductImageDTO toDTO(ProductImage productImage);

    List<ProductImageDTO> toDTOList(List<ProductImage> productImages);

    @Mapping(target = "idProductImage", ignore = true)
    @Mapping(target = "product", ignore = true)
    ProductImage toEntity(ProductImageDTO dto);
}
