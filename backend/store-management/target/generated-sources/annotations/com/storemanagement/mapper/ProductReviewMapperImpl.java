package com.storemanagement.mapper;

import com.storemanagement.dto.review.ProductReviewDTO;
import com.storemanagement.model.Customer;
import com.storemanagement.model.Product;
import com.storemanagement.model.ProductReview;
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
public class ProductReviewMapperImpl implements ProductReviewMapper {

    @Override
    public ProductReviewDTO toDTO(ProductReview review) {
        if ( review == null ) {
            return null;
        }

        ProductReviewDTO.ProductReviewDTOBuilder<?, ?> productReviewDTO = ProductReviewDTO.builder();

        productReviewDTO.idReview( review.getIdReview() );
        productReviewDTO.idProduct( reviewProductIdProduct( review ) );
        productReviewDTO.productName( reviewProductProductName( review ) );
        productReviewDTO.idCustomer( reviewCustomerIdCustomer( review ) );
        productReviewDTO.customerName( reviewCustomerCustomerName( review ) );
        productReviewDTO.rating( review.getRating() );
        productReviewDTO.comment( review.getComment() );
        productReviewDTO.createdAt( review.getCreatedAt() );
        productReviewDTO.updatedAt( review.getUpdatedAt() );
        productReviewDTO.adminReply( review.getAdminReply() );
        productReviewDTO.editCount( review.getEditCount() );

        productReviewDTO.idOrder( review.getOrder() != null ? review.getOrder().getIdOrder() : null );
        productReviewDTO.idOrderDetail( review.getOrderDetail() != null ? review.getOrderDetail().getIdOrderDetail() : null );

        return productReviewDTO.build();
    }

    @Override
    public List<ProductReviewDTO> toDTOList(List<ProductReview> reviews) {
        if ( reviews == null ) {
            return null;
        }

        List<ProductReviewDTO> list = new ArrayList<ProductReviewDTO>( reviews.size() );
        for ( ProductReview productReview : reviews ) {
            list.add( toDTO( productReview ) );
        }

        return list;
    }

    private Integer reviewProductIdProduct(ProductReview productReview) {
        Product product = productReview.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getIdProduct();
    }

    private String reviewProductProductName(ProductReview productReview) {
        Product product = productReview.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getProductName();
    }

    private Integer reviewCustomerIdCustomer(ProductReview productReview) {
        Customer customer = productReview.getCustomer();
        if ( customer == null ) {
            return null;
        }
        return customer.getIdCustomer();
    }

    private String reviewCustomerCustomerName(ProductReview productReview) {
        Customer customer = productReview.getCustomer();
        if ( customer == null ) {
            return null;
        }
        return customer.getCustomerName();
    }
}
