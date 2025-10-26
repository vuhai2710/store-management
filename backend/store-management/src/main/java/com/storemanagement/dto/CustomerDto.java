package com.storemanagement.dto;

import com.storemanagement.utility.CustomerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {
    private Integer idCustomer;
    private Integer idUser;
    private String username;
    private String email;
    private String customerName;
    private String phoneNumber;
    private String address;
    private CustomerType customerType;
    private LocalDateTime createdAt;
}
