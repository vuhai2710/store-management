package com.storemanagement.mapper;

import com.storemanagement.dto.review.ProductReviewDTO;
import com.storemanagement.model.ProductReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductReviewMapper {

    @Mapping(target = "idReview", source = "idReview")
    @Mapping(target = "idProduct", source = "product.idProduct")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "idCustomer", source = "customer.idCustomer")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "idOrder", expression = "java(review.getOrder() != null ? review.getOrder().getIdOrder() : null)")
    @Mapping(target = "idOrderDetail", expression = "java(review.getOrderDetail() != null ? review.getOrderDetail().getIdOrderDetail() : null)")
    @Mapping(target = "rating", source = "rating")
    @Mapping(target = "comment", source = "comment")
    ProductReviewDTO toDTO(ProductReview review);

    List<ProductReviewDTO> toDTOList(List<ProductReview> reviews);
}


