package com.storemanagement.dto;

import com.storemanagement.utility.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Integer idUser;
    private String username;
    private String email;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
