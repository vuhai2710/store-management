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
    
    private String brand;  // Thương hiệu sản phẩm
    
    private Integer idSupplier;  // Optional - nhà cung cấp
    
    private String supplierName;  // Optional

    private String description;

    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    // READ ONLY - Stock quantity chỉ được cập nhật từ inventory transactions (ImportOrder, Order)
    // Không cho phép set giá trị này khi tạo/sửa sản phẩm
    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer stockQuantity;

    private ProductStatus status;

    private String imageUrl;  // Giữ lại để backward compatibility - ảnh chính
    
    // Danh sách tất cả ảnh của sản phẩm (bao gồm cả ảnh chính)
    private List<ProductImageDTO> images;

    // productCode: có thể để trống nếu codeType = SKU (sẽ tự sinh)
    private String productCode;

    @NotNull(message = "Loại mã sản phẩm không được để trống")
    private CodeType codeType;

    // SKU: tự động sinh hoặc tự nhập
    private String sku;
}
