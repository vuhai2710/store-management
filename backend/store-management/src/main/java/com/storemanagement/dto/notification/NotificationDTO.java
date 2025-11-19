package com.storemanagement.dto.notification;

import com.storemanagement.utils.NotificationType;
import com.storemanagement.utils.ReferenceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Integer idNotification;
    private Integer idUser;
    private String username;
    private NotificationType notificationType;
    private String title;
    private String message;
    private ReferenceType referenceType;
    private Integer referenceId;
    private Boolean isRead;
    private Boolean sentEmail;
    private LocalDateTime createdAt;
}
