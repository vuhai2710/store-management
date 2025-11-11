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

    // Email: chỉ được set khi tạo user (create), không được phép cập nhật (update)
    // Validation email được thực hiện trong service khi create
    // Không dùng @ValidEmail ở đây vì DTO này dùng cho cả create và update
    // Khi update, email có thể là null và không cần validate
    private String email;

    private String customerName;

    @ValidPhone
    private String phoneNumber;

    private String address;
    private CustomerType customerType;
    private Boolean isActive;
    
    // Password field từ AuthenticationRequestDto (register)
    // Chỉ sử dụng khi tạo mới, không hiển thị trong response
    @JsonIgnore
    @Size(min = 4, message = "Mật khẩu phải có ít nhất 4 ký tự")
    private String password;
}
