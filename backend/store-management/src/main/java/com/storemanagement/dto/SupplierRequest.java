package com.storemanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {
    
    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    private String supplierName;
    
    private String address;
    
    private String phoneNumber;
    
    @Email(message = "Email không hợp lệ")
    private String email;
}
