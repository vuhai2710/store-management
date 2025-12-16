package com.storemanagement.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Lightweight DTO for displaying order summary in employee context
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeOrderDTO {
    private Integer idOrder;
    private String customerName;
    private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal finalAmount;
    private String status;
    private LocalDateTime createdAt;
}
