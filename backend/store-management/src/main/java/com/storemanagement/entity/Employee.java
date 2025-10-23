package com.storemanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_employee")
    private Integer idEmployee;
    
    @OneToOne
    @JoinColumn(name = "id_user", unique = true)
    private User user;
    
    @Column(name = "employee_name", nullable = false, length = 255)
    private String employeeName;
    
    @Column(name = "hire_date")
    private LocalDate hireDate;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "base_salary", precision = 12, scale = 2)
    private BigDecimal baseSalary;
}
