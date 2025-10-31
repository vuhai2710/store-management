package com.storemanagement.dto;

import com.storemanagement.utils.CodeType;
import com.storemanagement.utils.ProductStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Integer idProduct;

    @NotNull(message = "ID danh mục không được để trống")
    private Integer idCategory;
    
    private String categoryName;
    
    private Integer idSupplier;
    
    private String supplierName;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    private String description;

    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private Double price;

    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer stockQuantity;

    private ProductStatus status;

    private String imageUrl;

    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String productCode;

    private CodeType codeType;

    private String sku;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
