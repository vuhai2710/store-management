package com.storemanagement.mapper;

import com.storemanagement.dto.product.ProductImageDTO;
import com.storemanagement.model.Product;
import com.storemanagement.model.ProductImage;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-19T16:52:01+0700",
    comments = "version: 1.6.0.Beta1, compiler: javac, environment: Java 17.0.16 (Microsoft)"
)
@Component
public class ProductImageMapperImpl implements ProductImageMapper {

    @Override
    public ProductImageDTO toDTO(ProductImage productImage) {
        if ( productImage == null ) {
            return null;
        }

        ProductImageDTO.ProductImageDTOBuilder productImageDTO = ProductImageDTO.builder();

        productImageDTO.idProductImage( productImage.getIdProductImage() );
        productImageDTO.idProduct( productImageProductIdProduct( productImage ) );
        productImageDTO.createdAt( productImage.getCreatedAt() );
        productImageDTO.imageUrl( productImage.getImageUrl() );
        productImageDTO.isPrimary( productImage.getIsPrimary() );
        productImageDTO.displayOrder( productImage.getDisplayOrder() );

        return productImageDTO.build();
    }

    @Override
    public List<ProductImageDTO> toDTOList(List<ProductImage> productImages) {
        if ( productImages == null ) {
            return null;
        }

        List<ProductImageDTO> list = new ArrayList<ProductImageDTO>( productImages.size() );
        for ( ProductImage productImage : productImages ) {
            list.add( toDTO( productImage ) );
        }

        return list;
    }

    @Override
    public ProductImage toEntity(ProductImageDTO dto) {
        if ( dto == null ) {
            return null;
        }

        ProductImage.ProductImageBuilder productImage = ProductImage.builder();

        productImage.imageUrl( dto.getImageUrl() );
        productImage.isPrimary( dto.getIsPrimary() );
        productImage.displayOrder( dto.getDisplayOrder() );

        return productImage.build();
    }

    private Integer productImageProductIdProduct(ProductImage productImage) {
        Product product = productImage.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getIdProduct();
    }
}
