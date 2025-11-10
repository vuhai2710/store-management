package com.storemanagement.mapper;

import com.storemanagement.dto.response.ProductDto;
import com.storemanagement.dto.response.ProductImageDto;
import com.storemanagement.model.Category;
import com.storemanagement.model.Product;
import com.storemanagement.model.ProductImage;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:23:08+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductDto toDto(Product entity) {
        if ( entity == null ) {
            return null;
        }

        ProductDto.ProductDtoBuilder productDto = ProductDto.builder();

        productDto.idCategory( entityCategoryIdCategory( entity ) );
        productDto.categoryName( entityCategoryCategoryName( entity ) );
        productDto.brand( entity.getBrand() );
        productDto.codeType( entity.getCodeType() );
        productDto.createdAt( entity.getCreatedAt() );
        productDto.description( entity.getDescription() );
        productDto.idProduct( entity.getIdProduct() );
        productDto.imageUrl( entity.getImageUrl() );
        productDto.images( productImageListToProductImageDtoList( entity.getImages() ) );
        productDto.price( entity.getPrice() );
        productDto.productCode( entity.getProductCode() );
        productDto.productName( entity.getProductName() );
        productDto.sku( entity.getSku() );
        productDto.status( entity.getStatus() );
        productDto.stockQuantity( entity.getStockQuantity() );
        productDto.updatedAt( entity.getUpdatedAt() );

        productDto.idSupplier( entity.getSupplier() != null ? entity.getSupplier().getIdSupplier() : null );
        productDto.supplierName( entity.getSupplier() != null ? entity.getSupplier().getSupplierName() : null );

        return productDto.build();
    }

    @Override
    public Product toEntity(ProductDto dto) {
        if ( dto == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.brand( dto.getBrand() );
        product.codeType( dto.getCodeType() );
        product.description( dto.getDescription() );
        product.idProduct( dto.getIdProduct() );
        product.imageUrl( dto.getImageUrl() );
        product.images( productImageDtoListToProductImageList( dto.getImages() ) );
        product.price( dto.getPrice() );
        product.productCode( dto.getProductCode() );
        product.productName( dto.getProductName() );
        product.sku( dto.getSku() );
        product.status( dto.getStatus() );
        product.stockQuantity( dto.getStockQuantity() );

        return product.build();
    }

    @Override
    public List<ProductDto> toDtoList(List<Product> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ProductDto> list = new ArrayList<ProductDto>( entities.size() );
        for ( Product product : entities ) {
            list.add( toDto( product ) );
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

    protected ProductImageDto productImageToProductImageDto(ProductImage productImage) {
        if ( productImage == null ) {
            return null;
        }

        ProductImageDto.ProductImageDtoBuilder productImageDto = ProductImageDto.builder();

        productImageDto.createdAt( productImage.getCreatedAt() );
        productImageDto.displayOrder( productImage.getDisplayOrder() );
        productImageDto.idProductImage( productImage.getIdProductImage() );
        productImageDto.imageUrl( productImage.getImageUrl() );
        productImageDto.isPrimary( productImage.getIsPrimary() );

        return productImageDto.build();
    }

    protected List<ProductImageDto> productImageListToProductImageDtoList(List<ProductImage> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductImageDto> list1 = new ArrayList<ProductImageDto>( list.size() );
        for ( ProductImage productImage : list ) {
            list1.add( productImageToProductImageDto( productImage ) );
        }

        return list1;
    }

    protected ProductImage productImageDtoToProductImage(ProductImageDto productImageDto) {
        if ( productImageDto == null ) {
            return null;
        }

        ProductImage.ProductImageBuilder productImage = ProductImage.builder();

        productImage.displayOrder( productImageDto.getDisplayOrder() );
        productImage.idProductImage( productImageDto.getIdProductImage() );
        productImage.imageUrl( productImageDto.getImageUrl() );
        productImage.isPrimary( productImageDto.getIsPrimary() );

        return productImage.build();
    }

    protected List<ProductImage> productImageDtoListToProductImageList(List<ProductImageDto> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductImage> list1 = new ArrayList<ProductImage>( list.size() );
        for ( ProductImageDto productImageDto : list ) {
            list1.add( productImageDtoToProductImage( productImageDto ) );
        }

        return list1;
    }
}
