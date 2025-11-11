package com.storemanagement.dto.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.storemanagement.dto.base.BaseDTO;
import com.storemanagement.utils.Role;
import com.storemanagement.validation.ValidEmail;
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
public class UserDTO extends BaseDTO {
    private Integer idUser;

    @Size(min = 4, message = "Tên đăng nhập phải có ít nhất 4 ký tự")
    private String username;

    @ValidEmail
    private String email;

    @JsonIgnore
    @Size(min = 4, message = "Mật khẩu phải có ít nhất 4 ký tự")
    private String password;

    private Role role;
    private Boolean isActive;
    private String avatarUrl;
}
