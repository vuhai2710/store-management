package com.storemanagement.mapper;

import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.dto.product.ProductImageDTO;
import com.storemanagement.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProductImageMapper.class})
public interface ProductMapper {

    // Product → ProductDTO
    @Mapping(target = "idProduct", source = "idProduct")
    @Mapping(target = "idCategory", source = "category.idCategory")
    @Mapping(target = "categoryName", source = "category.categoryName")
    @Mapping(target = "brand", source = "brand")
    @Mapping(target = "idSupplier", expression = "java(entity.getSupplier() != null ? entity.getSupplier().getIdSupplier() : null)")
    @Mapping(target = "supplierName", expression = "java(entity.getSupplier() != null ? entity.getSupplier().getSupplierName() : null)")
    @Mapping(target = "images", source = "images")
    ProductDTO toDTO(Product entity);

    // ProductDTO → Product (for create/update)
    @Mapping(target = "idProduct", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "stockQuantity", ignore = true)
    Product toEntity(ProductDTO dto);

    List<ProductDTO> toDTOList(List<Product> entities);
}
