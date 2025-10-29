package com.storemanagement.dto;

import com.storemanagement.utils.CustomerType;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {
    private Integer idCustomer;
    private Integer idUser;
    private String username;

    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$", message = "Email phải có định dạng @gmail.com")
    private String email;

    private String customerName;

    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải có 10 số và bắt đầu bằng 0")
    private String phoneNumber;

    private String address;
    private CustomerType customerType;
    private String createdAt;
    private String updatedAt;
}
