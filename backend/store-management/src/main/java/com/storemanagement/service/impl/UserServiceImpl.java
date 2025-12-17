package com.storemanagement.service.impl;

import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.user.UserDTO;
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
    public UserDTO createCustomerUser(RegisterDTO request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = userRepository.save(user);

        customerService.createCustomerForUser(savedUser, request);
        return userMapper.toDTO(savedUser);
    }

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
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return userMapper.toDTOList(users);
    }

    @Override
    public PageResponse<UserDTO> getAllUsersPaginated(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserDTO> userDtos = userMapper.toDTOList(userPage.getContent());
        return PageUtils.toPageResponse(userPage, userDtos);
    }

    @Override
    public PageResponse<UserDTO> getUsersByIsActive(Boolean isActive, Pageable pageable) {
        Page<User> userPage = userRepository.findByIsActive(isActive, pageable);
        List<UserDTO> userDtos = userMapper.toDTOList(userPage.getContent());
        return PageUtils.toPageResponse(userPage, userDtos);
    }

    @Override
    public UserDTO getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));
        return userMapper.toDTO(user);
    }

    @Override
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với username: " + username));
        return userMapper.toDTO(user);
    }

    @Override
    public UserDTO updateUser(Integer id, UserDTO userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));

        if (userDto.getEmail() != null && !user.getEmail().equals(userDto.getEmail())) {

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
        return userMapper.toDTO(updatedUser);
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
    public UserDTO changeUserRole(Integer id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));

        try {
            Role newRole = Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            User updatedUser = userRepository.save(user);
            return userMapper.toDTO(updatedUser);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Role không hợp lệ: " + role);
        }
    }

    @Override
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại với ID: " + id));

        try {
            customerService.deleteCustomerByUser(user);
        } catch (RuntimeException e) {

        }

        userRepository.delete(user);
    }

    @Override
    public void changePassword(String username, String currentPassword, String newPassword) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public UserDTO uploadAvatar(String username, MultipartFile avatar) {
        log.info("Uploading avatar for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        try {

            String avatarUrl = fileStorageService.saveImage(avatar, "users");
            user.setAvatarUrl(avatarUrl);
            User savedUser = userRepository.save(user);

            log.info("Avatar uploaded successfully: {}", avatarUrl);
            return userMapper.toDTO(savedUser);

        } catch (Exception e) {
            log.error("Error uploading avatar: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể upload ảnh đại diện: " + e.getMessage());
        }
    }

    @Override
    public UserDTO updateAvatar(String username, MultipartFile avatar) {
        log.info("Updating avatar for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        try {

            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                fileStorageService.deleteImage(user.getAvatarUrl());
                log.info("Deleted old avatar: {}", user.getAvatarUrl());
            }

            String avatarUrl = fileStorageService.saveImage(avatar, "users");
            user.setAvatarUrl(avatarUrl);
            User savedUser = userRepository.save(user);

            log.info("Avatar updated successfully: {}", avatarUrl);
            return userMapper.toDTO(savedUser);

        } catch (Exception e) {
            log.error("Error updating avatar: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể cập nhật ảnh đại diện: " + e.getMessage());
        }
    }

    @Override
    public void deleteAvatar(String username) {
        log.info("Deleting avatar for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
            throw new RuntimeException("User không có ảnh đại diện");
        }

        try {

            fileStorageService.deleteImage(user.getAvatarUrl());

            user.setAvatarUrl(null);
            userRepository.save(user);

            log.info("Avatar deleted successfully");

        } catch (Exception e) {
            log.error("Error deleting avatar: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể xóa ảnh đại diện: " + e.getMessage());
        }
    }
}
