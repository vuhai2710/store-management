package com.storemanagement.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho ProductImage response
 * 
 * Chứa thông tin về một ảnh của sản phẩm
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageDto {
    
    @JsonProperty("idProductImage")
    private Integer idProductImage;
    
    @JsonProperty("idProduct")
    private Integer idProduct;
    
    @JsonProperty("imageUrl")
    private String imageUrl;
    
    @JsonProperty("isPrimary")
    private Boolean isPrimary;
    
    @JsonProperty("displayOrder")
    private Integer displayOrder;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
}




