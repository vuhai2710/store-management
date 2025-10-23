package com.storemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    
    private Integer idProduct;
    private Integer idCategory;
    private String categoryName;
    private String productName;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String status;
    private String imageUrl;
    private LocalDateTime createdAt;
}
