package com.storemanagement.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho item trong đơn hàng GHN
 * 
 * Sử dụng trong GHNCreateOrderRequestDto.items
 * Mô tả thông tin sản phẩm trong đơn hàng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GHNOrderItemDto {
    
    /**
     * Tên sản phẩm
     */
    @JsonProperty("name")
    private String name;
    
    /**
     * Mã sản phẩm (SKU)
     */
    @JsonProperty("code")
    private String code;
    
    /**
     * Số lượng
     */
    @JsonProperty("quantity")
    private Integer quantity;
    
    /**
     * Giá sản phẩm (VND)
     */
    @JsonProperty("price")
    private Integer price;
}




