package com.storemanagement.dto.employee;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storemanagement.dto.base.BaseDTO;
import com.storemanagement.validation.ValidPhone;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class EmployeeDTO extends BaseDTO {
    private Integer idEmployee;
    private Integer idUser;
    private Boolean isActive;

    @NotBlank(message = "Tên nhân viên không được để trống")
    private String employeeName;

    private LocalDate hireDate;

    @NotBlank(message = "Số điện thoại không được để trống")
    @ValidPhone
    private String phoneNumber;

    private String address;

    @DecimalMin(value = "0.0", message = "Lương cơ bản phải lớn hơn hoặc bằng 0")
    private BigDecimal baseSalary;

    @Size(min = 4, message = "Tên đăng nhập phải có ít nhất 4 ký tự")
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 4, message = "Mật khẩu phải có ít nhất 4 ký tự")
    private String password;

    private String email;
}
