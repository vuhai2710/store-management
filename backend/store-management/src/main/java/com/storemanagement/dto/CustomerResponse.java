package com.storemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    
    private Integer idCustomer;
    private Integer idUser;
    private String username;
    private String email;
    private String customerName;
    private String address;
    private String phoneNumber;
    private String customerType;
    private Boolean isActive;
}
