package com.storemanagement.dto;

import com.storemanagement.utils.Role;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Integer idUser;

    @Size(min = 4, message = "Tên đăng nhập phải có ít nhất 4 ký tự")
    private String username;

    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$", message = "Email phải có định dạng @gmail.com")
    private String email;

    private Role role;
    private Boolean isActive;
    private String createdAt;
    private String updatedAt;
}
