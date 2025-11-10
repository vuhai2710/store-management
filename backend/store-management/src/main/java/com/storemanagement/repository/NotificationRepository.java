package com.storemanagement.repository;

import com.storemanagement.model.Notification;
import com.storemanagement.utils.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    
    /**
     * Lấy tất cả notifications của user (sắp xếp theo thời gian mới nhất)
     */
    Page<Notification> findByUser_IdUserOrderByCreatedAtDesc(Integer userId, Pageable pageable);
    
    /**
     * Lấy notifications chưa đọc của user
     */
    Page<Notification> findByUser_IdUserAndIsReadFalseOrderByCreatedAtDesc(Integer userId, Pageable pageable);
    
    /**
     * Đếm số lượng notifications chưa đọc của user
     */
    Long countByUser_IdUserAndIsReadFalse(Integer userId);
    
    /**
     * Lấy notifications theo loại
     */
    Page<Notification> findByUser_IdUserAndNotificationTypeOrderByCreatedAtDesc(
            Integer userId, NotificationType type, Pageable pageable);
    
    /**
     * Đánh dấu tất cả notifications của user là đã đọc
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.idUser = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") Integer userId);
}











