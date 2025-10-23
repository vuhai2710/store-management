package com.storemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    
    private Integer idUser;
    
    @NotBlank(message = "Tên khách hàng không được để trống")
    private String customerName;
    
    private String address;
    
    private String phoneNumber;
    
    private String customerType; // VIP or REGULAR
}
