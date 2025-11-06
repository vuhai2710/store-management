package com.storemanagement.dto.request;

import com.storemanagement.validation.ValidPhone;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShippingAddressRequestDto {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String recipientName;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    @ValidPhone(message = "Số điện thoại không hợp lệ")
    private String phoneNumber;
    
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
    
    @Builder.Default
    private Boolean isDefault = false;
}


