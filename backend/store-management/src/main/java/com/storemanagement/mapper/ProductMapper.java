package com.storemanagement.mapper;

import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.dto.product.ProductImageDTO;
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
    @Mapping(target = "stockQuantity", ignore = true) // Read-only field
    // createdAt and updatedAt are inherited from BaseEntity and managed by JPA/Hibernate
    Product toEntity(ProductDTO dto);

    List<ProductDTO> toDTOList(List<Product> entities);
}
