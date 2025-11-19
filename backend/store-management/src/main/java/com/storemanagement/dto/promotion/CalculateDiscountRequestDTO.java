package com.storemanagement.dto.promotion;

import jakarta.validation.constraints.DecimalMin;
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
public class CalculateDiscountRequestDTO {
    @NotNull(message = "Tổng tiền đơn hàng không được để trống")
    @DecimalMin(value = "0.0", message = "Tổng tiền đơn hàng phải lớn hơn hoặc bằng 0")
    private BigDecimal totalAmount;

    private String customerType; // VIP, REGULAR
}

