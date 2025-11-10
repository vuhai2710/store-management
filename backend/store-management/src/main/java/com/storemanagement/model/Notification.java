package com.storemanagement.model;

import com.storemanagement.utils.NotificationType;
import com.storemanagement.utils.ReferenceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity Notification - Thông báo cho users
 * 
 * Lưu thông báo in-app và tracking việc gửi email
 * Hỗ trợ đánh dấu đã đọc và reference đến đối tượng liên quan
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notification")
    private Integer idNotification;
    
    /**
     * User nhận thông báo
     * Cascade: Khi xóa user → tự động xóa notifications của user đó
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", nullable = false)
    private User user;
    
    /**
     * Loại thông báo
     * ORDER_STATUS, LOW_STOCK, NEW_ORDER, NEW_CUSTOMER, INVENTORY_UPDATE, PROMOTION
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;
    
    /**
     * Tiêu đề thông báo (hiển thị bold)
     */
    @Column(name = "title", nullable = false)
    private String title;
    
    /**
     * Nội dung chi tiết thông báo
     */
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    /**
     * Loại đối tượng liên quan (ORDER, PRODUCT, CUSTOMER, IMPORT_ORDER, OTHER)
     * Dùng để navigate khi user click vào notification
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type")
    private ReferenceType referenceType;
    
    /**
     * ID của đối tượng liên quan
     * Ví dụ: orderId, productId, customerId...
     */
    @Column(name = "reference_id")
    private Integer referenceId;
    
    /**
     * Đã đọc chưa
     * false = chưa đọc (hiển thị badge số lượng)
     * true = đã đọc
     */
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    /**
     * Đã gửi email chưa
     * false = chỉ notification in-app
     * true = đã gửi cả email
     */
    @Column(name = "sent_email")
    private Boolean sentEmail = false;
    
    /**
     * Thời gian tạo notification
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
        if (sentEmail == null) {
            sentEmail = false;
        }
    }
}









