package com.storemanagement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportOrderDto {
    private Integer idImportOrder;

    @NotNull(message = "ID nhà cung cấp không được để trống")
    private Integer idSupplier;

    private String supplierName;
    private String supplierAddress;
    private String supplierPhone;
    private String supplierEmail;

    private Integer idEmployee;
    private String employeeName;

    private LocalDateTime orderDate;

    private BigDecimal totalAmount;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    @Valid
    private List<ImportOrderDetailDto> importOrderDetails;
}























