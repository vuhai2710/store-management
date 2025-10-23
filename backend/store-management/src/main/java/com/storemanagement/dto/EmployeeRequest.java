package com.storemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {
    
    private Integer idUser;
    
    @NotBlank(message = "Tên nhân viên không được để trống")
    private String employeeName;
    
    private LocalDate hireDate;
    
    private String phoneNumber;
    
    private String address;
    
    private BigDecimal baseSalary;
}
