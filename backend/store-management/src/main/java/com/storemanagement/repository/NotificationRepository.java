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

    Page<Notification> findByUser_IdUserOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    Page<Notification> findByUser_IdUserAndIsReadFalseOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    Long countByUser_IdUserAndIsReadFalse(Integer userId);

    Page<Notification> findByUser_IdUserAndNotificationTypeOrderByCreatedAtDesc(
            Integer userId, NotificationType type, Pageable pageable);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.idUser = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") Integer userId);
}
