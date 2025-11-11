package com.storemanagement.service;

import com.nimbusds.jose.JOSEException;
import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.auth.LoginDTO;
import com.storemanagement.dto.auth.AuthenticationResponseDTO;
import com.storemanagement.model.User;

public interface AuthenticationService {
    AuthenticationResponseDTO authenticate(LoginDTO request) throws JOSEException;
    AuthenticationResponseDTO register(RegisterDTO request) throws JOSEException;
    String generateToken(User user) throws JOSEException;
    
    /**
     * Quên mật khẩu - Tạo mật khẩu mới và gửi qua email
     * 
     * @param email Email của tài khoản cần khôi phục
     * @return Thông báo thành công
     */
    String forgotPassword(String email);
}
