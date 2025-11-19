package com.storemanagement.mapper;

import com.storemanagement.dto.product.ProductDTO;
import com.storemanagement.model.Category;
import com.storemanagement.model.Product;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:02+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Autowired
    private ProductImageMapper productImageMapper;

    @Override
    public ProductDTO toDTO(Product entity) {
        if ( entity == null ) {
            return null;
        }

        ProductDTO.ProductDTOBuilder<?, ?> productDTO = ProductDTO.builder();

        productDTO.idProduct( entity.getIdProduct() );
        productDTO.idCategory( entityCategoryIdCategory( entity ) );
        productDTO.categoryName( entityCategoryCategoryName( entity ) );
        productDTO.brand( entity.getBrand() );
        productDTO.images( productImageMapper.toDTOList( entity.getImages() ) );
        productDTO.createdAt( entity.getCreatedAt() );
        productDTO.updatedAt( entity.getUpdatedAt() );
        productDTO.productName( entity.getProductName() );
        productDTO.description( entity.getDescription() );
        productDTO.price( entity.getPrice() );
        productDTO.stockQuantity( entity.getStockQuantity() );
        productDTO.status( entity.getStatus() );
        productDTO.imageUrl( entity.getImageUrl() );
        productDTO.productCode( entity.getProductCode() );
        productDTO.codeType( entity.getCodeType() );
        productDTO.sku( entity.getSku() );

        productDTO.idSupplier( entity.getSupplier() != null ? entity.getSupplier().getIdSupplier() : null );
        productDTO.supplierName( entity.getSupplier() != null ? entity.getSupplier().getSupplierName() : null );

        return productDTO.build();
    }

    @Override
    public Product toEntity(ProductDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.productName( dto.getProductName() );
        product.brand( dto.getBrand() );
        product.description( dto.getDescription() );
        product.price( dto.getPrice() );
        product.status( dto.getStatus() );
        product.imageUrl( dto.getImageUrl() );
        product.productCode( dto.getProductCode() );
        product.codeType( dto.getCodeType() );
        product.sku( dto.getSku() );

        return product.build();
    }

    @Override
    public List<ProductDTO> toDTOList(List<Product> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ProductDTO> list = new ArrayList<ProductDTO>( entities.size() );
        for ( Product product : entities ) {
            list.add( toDTO( product ) );
        }

        return list;
    }

    private Integer entityCategoryIdCategory(Product product) {
        Category category = product.getCategory();
        if ( category == null ) {
            return null;
        }
        return category.getIdCategory();
    }

    private String entityCategoryCategoryName(Product product) {
        Category category = product.getCategory();
        if ( category == null ) {
            return null;
        }
        return category.getCategoryName();
    }
}
