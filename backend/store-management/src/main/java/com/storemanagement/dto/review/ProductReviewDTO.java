package com.storemanagement.dto.review;

import com.storemanagement.dto.base.BaseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ProductReviewDTO extends BaseDTO {
    private Integer idReview;
    private Integer idProduct;
    private String productName;
    private Integer idCustomer;
    private String customerName;
    private Integer idOrder;
    private Integer idOrderDetail;
    private Integer rating; // 1-5
    private String comment;
    private String adminReply;
    private Integer editCount;
}


