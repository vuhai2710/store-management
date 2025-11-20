package com.storemanagement.service;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.notification.NotificationDTO;
import com.storemanagement.model.User;
import com.storemanagement.utils.NotificationType;
import com.storemanagement.utils.ReferenceType;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    NotificationDTO createNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            ReferenceType referenceType,
            Integer referenceId,
            boolean sendEmail
    );

    PageResponse<NotificationDTO> getMyNotifications(String username, Pageable pageable);

    PageResponse<NotificationDTO> getUnreadNotifications(String username, Pageable pageable);

    Long getUnreadCount(String username);

    NotificationDTO markAsRead(Integer notificationId, String username);

    void markAllAsRead(String username);

    void deleteNotification(Integer notificationId, String username);
}