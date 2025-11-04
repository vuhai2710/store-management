package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_employee")
    private Integer idEmployee;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_user", unique = true)
    private User user;

    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "address")
    private String address;

    @Column(name = "base_salary")
    private BigDecimal baseSalary;
}


















