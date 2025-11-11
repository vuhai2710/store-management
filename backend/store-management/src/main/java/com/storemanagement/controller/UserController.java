package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.user.UserDTO;
import com.storemanagement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller xử lý các API liên quan đến User (Tài khoản người dùng)
 * Base URL: /api/v1/users
 * 
 * Phân quyền:
 * - ADMIN: có thể quản lý tất cả users (CRUD, activate/deactivate, change role)
 * - Authenticated users: có thể xem profile của chính mình qua /profile
 * 
 * Header: Authorization: Bearer {JWT_TOKEN}
 * 
 * @author Store Management Team
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getAllUsers(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "5") Integer pageSize,
            @RequestParam(defaultValue = "idUser") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<UserDTO> userPage = userService.getAllUsersPaginated(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách user thành công", userPage));
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getUsersByStatus(
            @RequestParam Boolean isActive,
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "5") Integer pageSize,
            @RequestParam(defaultValue = "idUser") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));

        PageResponse<UserDTO> userPage = userService.getUsersByIsActive(isActive, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách user theo trạng thái thành công", userPage));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Integer id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin user thành công", user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Integer id,
            @RequestBody @Valid UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật user thành công", updatedUser));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Integer id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("Vô hiệu hóa user thành công", null));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Integer id) {
        userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("Kích hoạt user thành công", null));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> changeUserRole(
            @PathVariable Integer id,
            @RequestParam String role) {
        UserDTO updatedUser = userService.changeUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success("Thay đổi role thành công", updatedUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa user thành công", null));
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserDTO user = userService.getUserByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin profile thành công", user));
    }

    /**
     * Upload ảnh đại diện cho user hiện tại
     * POST /api/v1/users/avatar
     * Content-Type: multipart/form-data
     * Body: avatar (file)
     * 
     * Chỉ user đã đăng nhập mới có thể upload avatar cho chính mình
     */
    @PostMapping(value = "/avatar", consumes = {"multipart/form-data"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> uploadAvatar(
            @RequestParam("avatar") MultipartFile avatar) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserDTO updatedUser = userService.uploadAvatar(username, avatar);
        return ResponseEntity.ok(ApiResponse.success("Upload ảnh đại diện thành công", updatedUser));
    }

    /**
     * Cập nhật ảnh đại diện cho user hiện tại
     * PUT /api/v1/users/avatar
     * Content-Type: multipart/form-data
     * Body: avatar (file)
     * 
     * Sẽ xóa ảnh cũ (nếu có) và upload ảnh mới
     */
    @PutMapping(value = "/avatar", consumes = {"multipart/form-data"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> updateAvatar(
            @RequestParam("avatar") MultipartFile avatar) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserDTO updatedUser = userService.updateAvatar(username, avatar);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ảnh đại diện thành công", updatedUser));
    }

    /**
     * Xóa ảnh đại diện của user hiện tại
     * DELETE /api/v1/users/avatar
     */
    @DeleteMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteAvatar() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        userService.deleteAvatar(username);
        return ResponseEntity.ok(ApiResponse.success("Xóa ảnh đại diện thành công", null));
    }
}
