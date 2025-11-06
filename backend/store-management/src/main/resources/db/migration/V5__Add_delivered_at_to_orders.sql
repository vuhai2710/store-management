-- Migration: Thêm column delivered_at vào bảng orders
-- Column này lưu thời điểm customer xác nhận đã nhận hàng

ALTER TABLE orders
ADD COLUMN delivered_at TIMESTAMP NULL COMMENT 'Thời điểm customer xác nhận đã nhận hàng';


