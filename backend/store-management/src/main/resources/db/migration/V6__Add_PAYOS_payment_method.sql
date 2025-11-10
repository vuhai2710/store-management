-- Migration: Thêm PAYOS vào payment_method enum và thêm column payment_link_id
-- 
-- Mục đích:
-- 1. Thêm PAYOS như một phương thức thanh toán mới (giữ nguyên CASH, TRANSFER, ZALOPAY)
-- 2. Thêm column payment_link_id để lưu PayOS payment link ID khi tạo payment link
--
-- Logic:
-- - ALTER TABLE để mở rộng enum payment_method từ ('CASH','TRANSFER','ZALOPAY') 
--   thành ('CASH','TRANSFER','ZALOPAY','PAYOS')
-- - Thêm column payment_link_id VARCHAR(255) để lưu PayOS payment link ID
--   (PayOS trả về payment link ID khi tạo payment link thành công)

-- Bước 1: Thêm PAYOS vào enum payment_method
-- MySQL không hỗ trợ ALTER ENUM trực tiếp, cần dùng MODIFY COLUMN
ALTER TABLE orders
MODIFY COLUMN payment_method ENUM('CASH','TRANSFER','ZALOPAY','PAYOS') DEFAULT NULL;

-- Bước 2: Thêm column payment_link_id để lưu PayOS payment link ID
-- Column này sẽ được set khi tạo payment link thành công từ PayOS API
ALTER TABLE orders
ADD COLUMN payment_link_id VARCHAR(255) NULL COMMENT 'PayOS payment link ID - được set khi tạo payment link thành công';

-- Tạo index để tìm order nhanh hơn khi nhận webhook từ PayOS
-- PayOS webhook sẽ gửi payment_link_id, cần tìm order tương ứng
CREATE INDEX idx_orders_payment_link_id ON orders(payment_link_id);



















