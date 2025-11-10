package com.storemanagement.service;

import com.nimbusds.jose.JOSEException;
import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.request.LoginRequestDto;
import com.storemanagement.dto.response.AuthenticationResponseDto;
import com.storemanagement.model.User;

public interface AuthenticationService {
    AuthenticationResponseDto authenticate(LoginRequestDto request) throws JOSEException;
    AuthenticationResponseDto register(AuthenticationRequestDto request) throws JOSEException;
    String generateToken(User user) throws JOSEException;
    
    /**
     * Quên mật khẩu - Tạo mật khẩu mới và gửi qua email
     * 
     * @param email Email của tài khoản cần khôi phục
     * @return Thông báo thành công
     */
    String forgotPassword(String email);
}
