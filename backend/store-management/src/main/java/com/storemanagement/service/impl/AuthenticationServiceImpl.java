package com.storemanagement.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.request.LoginRequestDto;
import com.storemanagement.dto.response.AuthenticationResponseDto;
import com.storemanagement.dto.response.UserDto;
import com.storemanagement.model.Employee;
import com.storemanagement.model.User;
import com.storemanagement.repository.EmployeeRepository;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.AuthenticationService;
import com.storemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserService userService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

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
        
        // Lấy employeeId nếu user là employee
        Optional<Integer> employeeIdOpt = Optional.empty();
        if ("EMPLOYEE".equals(user.getRole().name())) {
            employeeIdOpt = employeeRepository.findByUser_IdUser(user.getIdUser())
                    .map(Employee::getIdEmployee);
        }
        
        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("store-management.com")
                .expirationTime(Date.from(Instant.now().plus(24, ChronoUnit.HOURS)))
                .claim("role", user.getRole().name())
                .claim("idUser", user.getIdUser());
        
        // Chỉ thêm employeeId nếu user là employee
        employeeIdOpt.ifPresent(employeeId -> claimsBuilder.claim("employeeId", employeeId));
        
        JWTClaimsSet jwtClaimsSet = claimsBuilder.build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSSigner signer = new MACSigner(SIGNER_KEY.getBytes());
        JWSObject jwsObject = new JWSObject(header, payload);
        jwsObject.sign(signer);
        return jwsObject.serialize();
    }
}
