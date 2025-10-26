package com.storemanagement.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.storemanagement.dto.AuthenticationRequestDto;
import com.storemanagement.dto.AuthenticationResponseDto;
import com.storemanagement.dto.LoginRequestDto;
import com.storemanagement.dto.UserDto;
import com.storemanagement.model.User;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.AuthenticationService;
import com.storemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserService userService;
    private final UserRepository userRepository;

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    // LOGIN
    public AuthenticationResponseDto authenticate(LoginRequestDto request) throws JOSEException {
        User user = userService.verifyInfo(request.getUsername(), request.getPassword());
        String token = generateToken(user);

        return AuthenticationResponseDto.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    // REGISTER
    public AuthenticationResponseDto register(AuthenticationRequestDto request) throws JOSEException {
        UserDto userDTO = userService.createCustomerUser(request);
        User user = userRepository.findById(userDTO.getIdUser())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        String token = generateToken(user);
        return AuthenticationResponseDto.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    public String generateToken(User user) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("store-management.com")
                .expirationTime(Date.from(Instant.now().plus(24, ChronoUnit.HOURS)))
                .claim("role", user.getRole().name())
                .claim("idUser", user.getIdUser())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSSigner signer = new MACSigner(SIGNER_KEY.getBytes());
        JWSObject jwsObject = new JWSObject(header, payload);
        jwsObject.sign(signer);
        return jwsObject.serialize();
    }
}
