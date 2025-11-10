package com.storemanagement.mapper;

import com.storemanagement.dto.response.ProductDto;
import com.storemanagement.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * ProductMapper - MapStruct mapper cho Product entity
 *
 * Note: Date formatting được xử lý tự động bởi JacksonConfig (global config)
 * Number formatting (tránh scientific notation) được xử lý bởi JacksonConfig
 */
@Mapper(componentModel = "spring")
public interface ProductMapper {

    // Product → ProductDto
    @Mapping(target = "idCategory", source = "category.idCategory")
    @Mapping(target = "categoryName", source = "category.categoryName")
    @Mapping(target = "brand", source = "brand")
    @Mapping(target = "idSupplier", expression = "java(entity.getSupplier() != null ? entity.getSupplier().getIdSupplier() : null)")
    @Mapping(target = "supplierName", expression = "java(entity.getSupplier() != null ? entity.getSupplier().getSupplierName() : null)")
    ProductDto toDto(Product entity);

    // ProductDto → Product
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    Product toEntity(ProductDto dto);

    List<ProductDto> toDtoList(List<Product> entities);
}
