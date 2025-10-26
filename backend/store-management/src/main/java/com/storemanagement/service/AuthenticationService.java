package com.storemanagement.service;

import com.nimbusds.jose.JOSEException;
import com.storemanagement.dto.AuthenticationRequestDto;
import com.storemanagement.dto.AuthenticationResponseDto;
import com.storemanagement.model.User;
import com.storemanagement.dto.LoginRequestDto;

public interface AuthenticationService {
    AuthenticationResponseDto authenticate(LoginRequestDto request) throws JOSEException;
    AuthenticationResponseDto register(AuthenticationRequestDto request) throws JOSEException;
    String generateToken(User user) throws JOSEException;
}
