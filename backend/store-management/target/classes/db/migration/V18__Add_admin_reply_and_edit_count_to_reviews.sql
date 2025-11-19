-- Migration V18: Thêm admin_reply và edit_count vào product_reviews table

-- Thêm cột admin_reply để admin/employee có thể trả lời review
ALTER TABLE product_reviews
ADD COLUMN admin_reply TEXT NULL COMMENT 'Câu trả lời từ admin/employee';

-- Thêm cột edit_count để tracking số lần customer đã edit (giới hạn 1 lần)
ALTER TABLE product_reviews
ADD COLUMN edit_count INT NOT NULL DEFAULT 0 COMMENT 'Số lần đã chỉnh sửa review (tối đa 1 lần)';
