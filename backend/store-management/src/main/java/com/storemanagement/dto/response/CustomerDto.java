package com.storemanagement.dto.response;

import com.storemanagement.utils.CustomerType;
import com.storemanagement.validation.ValidEmail;
import com.storemanagement.validation.ValidPhone;
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

    @ValidEmail
    private String email;

    private String customerName;

    @ValidPhone
    private String phoneNumber;

    private String address;
    private CustomerType customerType;
    private Boolean isActive;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}




