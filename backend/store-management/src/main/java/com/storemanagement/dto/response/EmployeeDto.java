package com.storemanagement.dto.response;

import com.storemanagement.validation.ValidPhone;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {
    private Integer idEmployee;
    private Integer idUser;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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

    @Size(min = 4, message = "Mật khẩu phải có ít nhất 4 ký tự")
    private String password;

    // Email: chỉ được set khi tạo user (create), không được phép cập nhật (update)
    // Validation email được thực hiện trong service khi create
    // Không dùng @ValidEmail ở đây vì DTO này dùng cho cả create và update
    // Khi update, email có thể là null và không cần validate
    private String email;
}























