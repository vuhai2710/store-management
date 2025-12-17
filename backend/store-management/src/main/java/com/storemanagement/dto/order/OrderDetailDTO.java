package com.storemanagement.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailDTO {
    private Integer idOrderDetail;

    private Integer idProduct;
    private String productName;
    private String productCode;
    private String sku;

    private String productNameSnapshot;
    private String productCodeSnapshot;
    private String productImageSnapshot;

    private Integer quantity;
    private BigDecimal price;

    private BigDecimal subtotal;

    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer productId;

    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantityForCreate;
}
