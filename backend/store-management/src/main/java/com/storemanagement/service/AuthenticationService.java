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
}
