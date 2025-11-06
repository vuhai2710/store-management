package com.storemanagement.dto.response;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddressDto {
    private Integer idShippingAddress;
    
    private Integer idCustomer;
    
    @NotBlank(message = "Tên người nhận không được để trống")
    private String recipientName;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;
    
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
    
    @NotNull
    private Boolean isDefault;
    
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}


