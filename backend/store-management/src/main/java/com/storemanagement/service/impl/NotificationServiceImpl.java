package com.storemanagement.service.impl;

import com.storemanagement.dto.PageResponse;
import com.storemanagement.dto.response.NotificationDto;
import com.storemanagement.mapper.NotificationMapper;
import com.storemanagement.model.Notification;
import com.storemanagement.model.User;
import com.storemanagement.repository.NotificationRepository;
import com.storemanagement.repository.UserRepository;
import com.storemanagement.service.EmailService;
import com.storemanagement.service.NotificationService;
import com.storemanagement.utils.NotificationType;
import com.storemanagement.utils.PageUtils;
import com.storemanagement.utils.ReferenceType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    @Override
    public NotificationDto createNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            ReferenceType referenceType,
            Integer referenceId,
            boolean sendEmail) {
        
        log.info("Creating notification for user: {}, type: {}", user.getUsername(), type);
        
        // Tạo notification
        Notification notification = Notification.builder()
                .user(user)
                .notificationType(type)
                .title(title)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .isRead(false)
                .sentEmail(sendEmail)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        
        // Gửi email nếu cần
        if (sendEmail && user.getEmail() != null) {
            try {
                emailService.sendNotificationEmail(user.getEmail(), title, message);
                log.info("Sent notification email to: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send notification email to {}: {}", user.getEmail(), e.getMessage());
                // Không throw exception để không ảnh hưởng đến flow chính
            }
        }
        
        return notificationMapper.toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationDto> getMyNotifications(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        
        Page<Notification> notificationPage = notificationRepository
                .findByUser_IdUserOrderByCreatedAtDesc(user.getIdUser(), pageable);
        
        return PageUtils.toPageResponse(notificationPage,
                notificationMapper.toDtoList(notificationPage.getContent()));
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationDto> getUnreadNotifications(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        
        Page<Notification> notificationPage = notificationRepository
                .findByUser_IdUserAndIsReadFalseOrderByCreatedAtDesc(user.getIdUser(), pageable);
        
        return PageUtils.toPageResponse(notificationPage,
                notificationMapper.toDtoList(notificationPage.getContent()));
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        
        return notificationRepository.countByUser_IdUserAndIsReadFalse(user.getIdUser());
    }
    
    @Override
    public NotificationDto markAsRead(Integer notificationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification không tồn tại"));
        
        // Kiểm tra notification có thuộc về user không
        if (!notification.getUser().getIdUser().equals(user.getIdUser())) {
            throw new RuntimeException("Không có quyền truy cập notification này");
        }
        
        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        
        return notificationMapper.toDto(updated);
    }
    
    @Override
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        
        notificationRepository.markAllAsReadByUserId(user.getIdUser());
        log.info("Marked all notifications as read for user: {}", username);
    }
    
    @Override
    public void deleteNotification(Integer notificationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification không tồn tại"));
        
        // Kiểm tra notification có thuộc về user không
        if (!notification.getUser().getIdUser().equals(user.getIdUser())) {
            throw new RuntimeException("Không có quyền xóa notification này");
        }
        
        notificationRepository.delete(notification);
        log.info("Deleted notification {} for user: {}", notificationId, username);
    }
}





