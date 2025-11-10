package com.storemanagement.service.impl;

import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.response.UserDto;
import com.storemanagement.mapper.UserMapper;
import com.storemanagement.model.User;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.CustomerService;
import com.storemanagement.service.UserService;
import com.storemanagement.service.FileStorageService;
import com.storemanagement.utils.PageUtils;
import com.storemanagement.utils.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final CustomerService customerService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

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
        
        // Chỉ validate email unique khi email thay đổi
        if (userDto.getEmail() != null && !user.getEmail().equals(userDto.getEmail())) {
            // Kiểm tra email đã được sử dụng bởi user khác chưa
            userRepository.findByEmail(userDto.getEmail())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getIdUser().equals(id)) {
                            throw new RuntimeException("Email đã được sử dụng: " + userDto.getEmail());
                        }
                    });
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

    /**
     * Upload ảnh đại diện cho user
     * 
     * Logic:
     * 1. Kiểm tra user tồn tại
     * 2. Upload ảnh vào thư mục uploads/users/
     * 3. Lưu URL vào database
     * 
     * @param username Username của user
     * @param avatar File ảnh
     * @return UserDto đã được cập nhật
     */
    @Override
    public UserDto uploadAvatar(String username, MultipartFile avatar) {
        log.info("Uploading avatar for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        try {
            // Upload ảnh vào thư mục uploads/users/
            String avatarUrl = fileStorageService.saveImage(avatar, "users");
            user.setAvatarUrl(avatarUrl);
            User savedUser = userRepository.save(user);
            
            log.info("Avatar uploaded successfully: {}", avatarUrl);
            return userMapper.toDto(savedUser);
            
        } catch (Exception e) {
            log.error("Error uploading avatar: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể upload ảnh đại diện: " + e.getMessage());
        }
    }

    /**
     * Cập nhật ảnh đại diện cho user
     * Sẽ xóa ảnh cũ (nếu có) và upload ảnh mới
     * 
     * @param username Username của user
     * @param avatar File ảnh mới
     * @return UserDto đã được cập nhật
     */
    @Override
    public UserDto updateAvatar(String username, MultipartFile avatar) {
        log.info("Updating avatar for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        try {
            // Xóa ảnh cũ nếu có
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                fileStorageService.deleteImage(user.getAvatarUrl());
                log.info("Deleted old avatar: {}", user.getAvatarUrl());
            }
            
            // Upload ảnh mới
            String avatarUrl = fileStorageService.saveImage(avatar, "users");
            user.setAvatarUrl(avatarUrl);
            User savedUser = userRepository.save(user);
            
            log.info("Avatar updated successfully: {}", avatarUrl);
            return userMapper.toDto(savedUser);
            
        } catch (Exception e) {
            log.error("Error updating avatar: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể cập nhật ảnh đại diện: " + e.getMessage());
        }
    }

    /**
     * Xóa ảnh đại diện của user
     * 
     * @param username Username của user
     */
    @Override
    public void deleteAvatar(String username) {
        log.info("Deleting avatar for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
            throw new RuntimeException("User không có ảnh đại diện");
        }
        
        try {
            // Xóa file ảnh
            fileStorageService.deleteImage(user.getAvatarUrl());
            
            // Xóa URL trong database
            user.setAvatarUrl(null);
            userRepository.save(user);
            
            log.info("Avatar deleted successfully");
            
        } catch (Exception e) {
            log.error("Error deleting avatar: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể xóa ảnh đại diện: " + e.getMessage());
        }
    }
}
