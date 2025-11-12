-- ============================================================
-- BẢNG NOTIFICATIONS
-- Lưu thông báo cho users (admin, employee, customer)
-- ============================================================

CREATE TABLE notifications (
    id_notification INT NOT NULL AUTO_INCREMENT,
    id_user INT NOT NULL COMMENT 'User nhận thông báo',
    notification_type ENUM('ORDER_STATUS', 'LOW_STOCK', 'NEW_ORDER', 'NEW_CUSTOMER', 'INVENTORY_UPDATE', 'PROMOTION') NOT NULL COMMENT 'Loại thông báo',
    title VARCHAR(255) NOT NULL COMMENT 'Tiêu đề thông báo',
    message TEXT NOT NULL COMMENT 'Nội dung thông báo',
    reference_type ENUM('ORDER', 'PRODUCT', 'CUSTOMER', 'IMPORT_ORDER', 'OTHER') COMMENT 'Loại đối tượng liên quan',
    reference_id INT COMMENT 'ID đối tượng liên quan',
    is_read TINYINT(1) DEFAULT 0 COMMENT 'Đã đọc chưa',
    sent_email TINYINT(1) DEFAULT 0 COMMENT 'Đã gửi email chưa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_notification),
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    INDEX idx_user_read (id_user, is_read),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bảng lưu thông báo cho users';





















