package com.storemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    private String token;
    private String type = "Bearer";
    private Integer userId;
    private String username;
    private String email;
    private String role;
    
    public LoginResponse(String token, Integer userId, String username, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }
}
