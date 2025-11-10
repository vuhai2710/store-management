package com.storemanagement.mapper;

import com.storemanagement.dto.response.ProductImageDto;
import com.storemanagement.model.Product;
import com.storemanagement.model.ProductImage;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T13:14:05+0700",
    comments = "version: 1.6.0.Beta1, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ProductImageMapperImpl implements ProductImageMapper {

    @Override
    public ProductImageDto toDto(ProductImage productImage) {
        if ( productImage == null ) {
            return null;
        }

        ProductImageDto.ProductImageDtoBuilder productImageDto = ProductImageDto.builder();

        productImageDto.idProduct( productImageProductIdProduct( productImage ) );
        productImageDto.createdAt( productImage.getCreatedAt() );
        productImageDto.displayOrder( productImage.getDisplayOrder() );
        productImageDto.idProductImage( productImage.getIdProductImage() );
        productImageDto.imageUrl( productImage.getImageUrl() );
        productImageDto.isPrimary( productImage.getIsPrimary() );

        return productImageDto.build();
    }

    @Override
    public List<ProductImageDto> toDtoList(List<ProductImage> productImages) {
        if ( productImages == null ) {
            return null;
        }

        List<ProductImageDto> list = new ArrayList<ProductImageDto>( productImages.size() );
        for ( ProductImage productImage : productImages ) {
            list.add( toDto( productImage ) );
        }

        return list;
    }

    private Integer productImageProductIdProduct(ProductImage productImage) {
        Product product = productImage.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getIdProduct();
    }
}
