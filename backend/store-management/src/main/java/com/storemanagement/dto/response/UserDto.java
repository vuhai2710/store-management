package com.storemanagement.dto.response;

import com.storemanagement.utils.Role;
import com.storemanagement.validation.ValidEmail;
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

    @ValidEmail
    private String email;

    private Role role;
    private Boolean isActive;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}




