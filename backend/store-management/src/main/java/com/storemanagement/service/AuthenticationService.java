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
    String forgotPassword(String email);
}
