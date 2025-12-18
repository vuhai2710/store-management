package com.storemanagement.dto.employee;

import com.storemanagement.dto.base.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class EmployeeDetailDTO extends BaseDTO {

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

    private Long totalOrdersHandled;
    private BigDecimal totalOrderAmount;
    private Long totalReturnOrders;
    private Long totalExchangeOrders;

    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
}
