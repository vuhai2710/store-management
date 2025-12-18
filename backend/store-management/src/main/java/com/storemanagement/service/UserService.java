package com.storemanagement.service;

import com.storemanagement.dto.auth.RegisterDTO;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.user.UserDTO;
import com.storemanagement.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserDTO createCustomerUser(RegisterDTO request);
    User verifyInfo(String username, String password);

    List<UserDTO> getAllUsers();
    PageResponse<UserDTO> getAllUsersPaginated(Pageable pageable);
    PageResponse<UserDTO> getUsersByIsActive(Boolean isActive, Pageable pageable);
    UserDTO getUserById(Integer id);
    UserDTO getUserByUsername(String username);
    UserDTO updateUser(Integer id, UserDTO userDTO);
    void deactivateUser(Integer id);
    void activateUser(Integer id);
    UserDTO changeUserRole(Integer id, String role);
    void deleteUser(Integer id);
    void changePassword(String username, String currentPassword, String newPassword);

    UserDTO uploadAvatar(String username, MultipartFile avatar);
    UserDTO updateAvatar(String username, MultipartFile avatar);
    void deleteAvatar(String username);
}
