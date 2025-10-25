package com.storemanagement.service;

import com.storemanagement.dto.AuthenticationDTO;
import com.storemanagement.mapper.AuthenticationMapper;
import com.storemanagement.model.Customer;
import com.storemanagement.model.User;
import com.storemanagement.repository.CustomerRepository;
import com.storemanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationMapper authenticationMapper;

    public AuthenticationDTO registerUser(AuthenticationDTO authenticationDTO) {
        User user = authenticationMapper.toUser(authenticationDTO);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        Customer customer = authenticationMapper.toCustomer(authenticationDTO);
        customer.setUser(savedUser);
        Customer saveCustomer = customerRepository.save(customer);

        return authenticationMapper.toDto()
    }
}
