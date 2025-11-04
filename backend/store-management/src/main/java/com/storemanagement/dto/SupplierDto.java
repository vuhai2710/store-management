package com.storemanagement.dto;

import com.storemanagement.validation.ValidEmail;
import com.storemanagement.validation.ValidPhone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDto {
    private Integer idSupplier;

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    @Size(max = 255, message = "Tên nhà cung cấp không được vượt quá 255 ký tự")
    private String supplierName;

    private String address;

    @ValidPhone
    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phoneNumber;

    @ValidEmail
    private String email;

    private LocalDateTime createdAt;
}



















