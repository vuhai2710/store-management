package com.storemanagement.dto.customer;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.storemanagement.dto.base.BaseDTO;
import com.storemanagement.utils.CustomerType;
import com.storemanagement.validation.ValidPhone;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class CustomerDTO extends BaseDTO {
    private Integer idCustomer;
    private Integer idUser;
    private String username;

    private String email;

    private String customerName;

    @ValidPhone
    private String phoneNumber;

    private String address;
    private CustomerType customerType;
    private Boolean isActive;

    @JsonIgnore
    @Size(min = 4, message = "Mật khẩu phải có ít nhất 4 ký tự")
    private String password;
}
