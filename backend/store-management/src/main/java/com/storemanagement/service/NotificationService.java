package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.notification.NotificationDTO;
import com.storemanagement.model.User;
import com.storemanagement.utils.NotificationType;
import com.storemanagement.utils.ReferenceType;
import org.springframework.data.domain.Pageable;

/**
 * Service để quản lý notifications
 */
public interface NotificationService {
    
    /**
     * Tạo notification mới
     * 
     * @param user User nhận notification
     * @param type Loại notification
     * @param title Tiêu đề
     * @param message Nội dung
     * @param referenceType Loại đối tượng liên quan
     * @param referenceId ID đối tượng liên quan
     * @param sendEmail Có gửi email không
     * @return NotificationDTO
     */
    NotificationDTO createNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            ReferenceType referenceType,
            Integer referenceId,
            boolean sendEmail
    );
    
    /**
     * Lấy tất cả notifications của user hiện tại (phân trang)
     */
    PageResponse<NotificationDTO> getMyNotifications(String username, Pageable pageable);
    
    /**
     * Lấy notifications chưa đọc của user hiện tại
     */
    PageResponse<NotificationDTO> getUnreadNotifications(String username, Pageable pageable);
    
    /**
     * Đếm số lượng notifications chưa đọc
     */
    Long getUnreadCount(String username);
    
    /**
     * Đánh dấu notification là đã đọc
     */
    NotificationDTO markAsRead(Integer notificationId, String username);
    
    /**
     * Đánh dấu tất cả notifications là đã đọc
     */
    void markAllAsRead(String username);
    
    /**
     * Xóa notification
     */
    void deleteNotification(Integer notificationId, String username);
}












