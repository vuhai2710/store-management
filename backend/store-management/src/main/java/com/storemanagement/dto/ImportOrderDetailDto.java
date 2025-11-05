package com.storemanagement.dto;

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
public class ImportOrderDetailDto {
    private Integer idImportOrderDetail;

    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer idProduct;

    private String productName;
    private String productCode;
    private String sku;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;

    @NotNull(message = "Giá nhập không được để trống")
    @Min(value = 0, message = "Giá nhập phải lớn hơn hoặc bằng 0")
    private BigDecimal importPrice;

    private BigDecimal subtotal;  // quantity * importPrice
}























