package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.notification.NotificationDTO;
import com.storemanagement.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDTO>>> getMyNotifications(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));
        
        PageResponse<NotificationDTO> notifications = 
                notificationService.getMyNotifications(username, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách thông báo thành công", notifications));
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDTO>>> getUnreadNotifications(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, 
                Sort.by(Sort.Direction.DESC, "createdAt"));
        
        PageResponse<NotificationDTO> notifications = 
                notificationService.getUnreadNotifications(username, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông báo chưa đọc thành công", notifications));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        Long count = notificationService.getUnreadCount(username);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy số lượng thông báo chưa đọc thành công", count));
    }

    @PutMapping("/{id}/mark-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationDTO>> markAsRead(@PathVariable Integer id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        NotificationDTO notification = notificationService.markAsRead(id, username);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Đánh dấu đã đọc thành công", notification));
    }

    @PutMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        notificationService.markAllAsRead(username);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Đánh dấu tất cả thông báo là đã đọc thành công", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Integer id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        notificationService.deleteNotification(id, username);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Xóa thông báo thành công", null));
    }
}