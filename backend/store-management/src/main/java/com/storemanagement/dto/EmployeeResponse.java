package com.storemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    
    private Integer idEmployee;
    private Integer idUser;
    private String username;
    private String email;
    private String employeeName;
    private LocalDate hireDate;
    private String phoneNumber;
    private String address;
    private BigDecimal baseSalary;
    private Boolean isActive;
}
