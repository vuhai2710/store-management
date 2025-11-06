-- ============================================================
-- FLYWAY MIGRATION: V2 - Seed Initial Data
-- ============================================================
-- File này chứa dữ liệu mẫu cho development
-- Chỉ chạy khi dữ liệu chưa tồn tại (sử dụng ON DUPLICATE KEY UPDATE hoặc IF NOT EXISTS)
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- SEED DATA: Categories
-- ============================================================
INSERT INTO categories (category_name, code_prefix) VALUES
('Điện thoại', 'DT'),
('Laptop', 'LT'),
('Tablet', 'TB'),
('Phụ kiện', 'PK'),
('Đồng hồ thông minh', 'DH')
ON DUPLICATE KEY UPDATE category_name = category_name;

-- ============================================================
-- SEED DATA: Suppliers
-- ============================================================
INSERT INTO suppliers (supplier_name, address, phone_number, email) VALUES
('Apple Inc.', '1 Apple Park Way, Cupertino, CA 95014, USA', '+1-408-996-1010', 'contact@apple.com'),
('Samsung Electronics', '129 Samsung-ro, Yeongtong-gu, Suwon, Gyeonggi-do, South Korea', '+82-2-2053-3000', 'contact@samsung.com'),
('Xiaomi Corporation', 'Wangjing Science and Technology Park, Beijing, China', '+86-10-6060-6888', 'contact@mi.com'),
('HP Inc.', '1501 Page Mill Rd, Palo Alto, CA 94304, USA', '+1-650-857-1501', 'contact@hp.com'),
('Dell Technologies', 'One Dell Way, Round Rock, TX 78682, USA', '+1-512-338-4400', 'contact@dell.com')
ON DUPLICATE KEY UPDATE supplier_name = supplier_name;

-- ============================================================
-- LƯU Ý: 
-- - Dữ liệu users/admin được tạo tự động bởi AppInitConfig
-- - Dữ liệu thực tế (customers, orders, products...) nên được thêm qua API
-- - File này chỉ chứa dữ liệu reference/master data cần thiết cho development
-- ============================================================















