package com.storemanagement.service;

import com.storemanagement.dto.request.AuthenticationRequestDto;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.response.UserDto;
import com.storemanagement.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserDto createCustomerUser(AuthenticationRequestDto request);
    User verifyInfo(String username, String password);

    List<UserDto> getAllUsers();
    PageResponse<UserDto> getAllUsersPaginated(Pageable pageable);
    PageResponse<UserDto> getUsersByIsActive(Boolean isActive, Pageable pageable);
    UserDto getUserById(Integer id);
    UserDto getUserByUsername(String username);
    UserDto updateUser(Integer id, UserDto userDto);
    void deactivateUser(Integer id);
    void activateUser(Integer id);
    UserDto changeUserRole(Integer id, String role);
    void deleteUser(Integer id);
    void changePassword(String username, String currentPassword, String newPassword);
    
    // Avatar management
    UserDto uploadAvatar(String username, MultipartFile avatar);
    UserDto updateAvatar(String username, MultipartFile avatar);
    void deleteAvatar(String username);
}
