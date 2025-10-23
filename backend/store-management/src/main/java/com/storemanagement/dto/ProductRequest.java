package com.storemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    
    private Integer idCategory;
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;
    
    private String description;
    
    @NotNull(message = "Giá sản phẩm không được để trống")
    private BigDecimal price;
    
    private Integer stockQuantity;
    
    private String status;
    
    private String imageUrl;
}
