package com.storemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    
    private Integer idSupplier;
    private String supplierName;
    private String address;
    private String phoneNumber;
    private String email;
    private LocalDateTime createdAt;
}
