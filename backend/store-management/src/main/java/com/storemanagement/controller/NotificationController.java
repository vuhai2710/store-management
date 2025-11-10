package com.storemanagement.controller;

import com.storemanagement.dto.ApiResponse;
import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.response.NotificationDto;
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

/**
 * Controller xử lý các API liên quan đến Notifications
 * Base URL: /api/v1/notifications
 * 
 * Tất cả endpoints yêu cầu authentication (ADMIN, EMPLOYEE, CUSTOMER)
 * User chỉ có thể xem/thao tác notifications của chính mình
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    /**
     * Lấy tất cả notifications của tôi
     * GET /api/v1/notifications
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDto>>> getMyNotifications(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(direction, sortBy));
        
        PageResponse<NotificationDto> notifications = 
                notificationService.getMyNotifications(username, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách thông báo thành công", notifications));
    }
    
    /**
     * Lấy notifications chưa đọc
     * GET /api/v1/notifications/unread
     */
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDto>>> getUnreadNotifications(
            @RequestParam(required = false, defaultValue = "1") Integer pageNo,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, 
                Sort.by(Sort.Direction.DESC, "createdAt"));
        
        PageResponse<NotificationDto> notifications = 
                notificationService.getUnreadNotifications(username, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông báo chưa đọc thành công", notifications));
    }
    
    /**
     * Đếm số lượng notifications chưa đọc
     * GET /api/v1/notifications/unread-count
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        Long count = notificationService.getUnreadCount(username);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy số lượng thông báo chưa đọc thành công", count));
    }
    
    /**
     * Đánh dấu notification là đã đọc
     * PUT /api/v1/notifications/{id}/mark-read
     */
    @PutMapping("/{id}/mark-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(@PathVariable Integer id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        NotificationDto notification = notificationService.markAsRead(id, username);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Đánh dấu đã đọc thành công", notification));
    }
    
    /**
     * Đánh dấu tất cả notifications là đã đọc
     * PUT /api/v1/notifications/mark-all-read
     */
    @PutMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        notificationService.markAllAsRead(username);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Đánh dấu tất cả thông báo là đã đọc thành công", null));
    }
    
    /**
     * Xóa notification
     * DELETE /api/v1/notifications/{id}
     */
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





