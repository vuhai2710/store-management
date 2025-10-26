package com.storemanagement.service.impl;

import com.storemanagement.dto.AuthenticationRequestDto;
import com.storemanagement.dto.UserDto;
import com.storemanagement.mapper.UserMapper;
import com.storemanagement.model.User;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.UserService;
import com.storemanagement.utility.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final CustomerService customerService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDto createCustomerUser(AuthenticationRequestDto request) {
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = userRepository.save(user);

        customerService.createCustomerForUser(savedUser, request);
        return userMapper.toDto(savedUser);
    }

    // Verify cho login
    @Override
    public User verifyInfo(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Sai mật khẩu");
        }
        return user;
    }

    @Override
    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return userMapper.toDtoList(users);
    }

    @Override
    public UserDto getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));
        return userMapper.toDto(user);
    }

    @Override
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với username: " + username));
        return userMapper.toDto(user);
    }

    @Override
    public UserDto updateUser(Integer id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));
        
        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }
        if (userDto.getRole() != null) {
            user.setRole(userDto.getRole());
        }
        if (userDto.getIsActive() != null) {
            user.setIsActive(userDto.getIsActive());
        }
        
        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    @Override
    public void deactivateUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    public void activateUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));
        user.setIsActive(true);
        userRepository.save(user);
    }

    @Override
    public UserDto changeUserRole(Integer id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));
        
        try {
            Role newRole = Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            User updatedUser = userRepository.save(user);
            return userMapper.toDto(updatedUser);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Role không hợp lệ: " + role);
        }
    }

    @Override
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));
        userRepository.delete(user);
    }
}
