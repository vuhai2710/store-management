package com.storemanagement.dto.product;

import com.storemanagement.dto.base.BaseDTO;
import com.storemanagement.utils.CodeType;
import com.storemanagement.utils.ProductStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ProductDTO extends BaseDTO {
    private Integer idProduct;

    @NotNull(message = "ID danh mục không được để trống")
    private Integer idCategory;

    private String categoryName;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    private String brand;

    private Integer idSupplier;

    private String supplierName;

    private String description;

    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer stockQuantity;

    private ProductStatus status;

    private String imageUrl;

    private List<ProductImageDTO> images;

    private String productCode;

    @NotNull(message = "Loại mã sản phẩm không được để trống")
    private CodeType codeType;

    private String sku;

    private Double averageRating;

    private Integer reviewCount;
}
