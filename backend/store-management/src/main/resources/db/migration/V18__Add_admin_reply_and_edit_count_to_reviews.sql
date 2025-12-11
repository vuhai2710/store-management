ALTER TABLE product_reviews
ADD COLUMN admin_reply TEXT NULL COMMENT 'Câu trả lời từ admin/employee';

ALTER TABLE product_reviews
ADD COLUMN edit_count INT NOT NULL DEFAULT 0 COMMENT 'Số lần đã chỉnh sửa review (tối đa 1 lần)';
