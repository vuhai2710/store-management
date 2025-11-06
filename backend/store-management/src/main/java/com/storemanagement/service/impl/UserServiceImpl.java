package com.storemanagement.service.impl;

import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.response.UserDto;
import com.storemanagement.mapper.UserMapper;
import com.storemanagement.model.User;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.UserService;
import com.storemanagement.utils.PageUtils;
import com.storemanagement.utils.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public PageResponse<UserDto> getAllUsersPaginated(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable); //Lấy thông tin
        List<UserDto> userDtos = userMapper.toDtoList(userPage.getContent()); //Map entity sang dto
        return PageUtils.toPageResponse(userPage, userDtos); //(page, data)
    }

    @Override
    public PageResponse<UserDto> getUsersByIsActive(Boolean isActive, Pageable pageable) {
        Page<User> userPage = userRepository.findByIsActive(isActive, pageable); //Lấy thông tin theo isActive
        List<UserDto> userDtos = userMapper.toDtoList(userPage.getContent()); //Map entity sang dto
        return PageUtils.toPageResponse(userPage, userDtos); //(page, data)
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
        
        // Xóa customer liên quan trước nếu có
        try {
            customerService.deleteCustomerByUser(user);
        } catch (RuntimeException e) {
            // Nếu không tìm thấy customer thì bỏ qua
        }
        
        userRepository.delete(user);
    }

    /**
     * Đổi mật khẩu cho user
     * 
     * Logic xử lý:
     * 1. Kiểm tra user tồn tại
     * 2. Verify mật khẩu hiện tại bằng passwordEncoder.matches()
     * 3. Encode mật khẩu mới bằng BCrypt
     * 4. Cập nhật mật khẩu mới vào database
     * 
     * Security:
     * - Mật khẩu được hash bằng BCrypt trước khi lưu
     * - So sánh mật khẩu hiện tại bằng passwordEncoder.matches() (an toàn)
     */
    @Override
    public void changePassword(String username, String currentPassword, String newPassword) {
        // Kiểm tra user tồn tại
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        // Verify mật khẩu hiện tại
        // Sử dụng passwordEncoder.matches() để so sánh plain text với hash
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        
        // Encode mật khẩu mới bằng BCrypt và cập nhật
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
