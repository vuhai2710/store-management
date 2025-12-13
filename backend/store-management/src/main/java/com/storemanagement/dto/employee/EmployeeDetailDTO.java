package com.storemanagement.dto.employee;

import com.storemanagement.dto.base.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for Employee detail with order statistics
 */
@Data
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class EmployeeDetailDTO extends BaseDTO {
    // Basic Employee Info
    private Integer idEmployee;
    private Integer idUser;
    private Boolean isActive;
    private String employeeName;
    private LocalDate hireDate;
    private String phoneNumber;
    private String address;
    private BigDecimal baseSalary;
    private String username;
    private String email;
    private String avatarUrl;

    // Order Statistics
    private Long totalOrdersHandled;          // Tổng số đơn hàng đã xử lý
    private BigDecimal totalOrderAmount;       // Tổng giá trị đơn hàng
    private Long totalReturnOrders;            // Số yêu cầu đổi/trả đã xử lý
    private Long totalExchangeOrders;          // Số yêu cầu đổi hàng đã xử lý
    
    // Computed Statistics
    private Long pendingOrders;                // Đơn hàng đang chờ xử lý
    private Long completedOrders;              // Đơn hàng đã hoàn thành
    private Long cancelledOrders;              // Đơn hàng đã hủy
}
