package com.storemanagement.dto.product;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ProductImageDTO không kế thừa BaseDTO vì ProductImage entity chỉ có created_at (không có updated_at)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageDTO {
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
