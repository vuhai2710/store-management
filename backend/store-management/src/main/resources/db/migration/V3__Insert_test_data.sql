-- ============================================================
-- FLYWAY MIGRATION: V3 - Insert Test Data
-- ============================================================
-- File này chứa dữ liệu mẫu để test các chức năng trong project
-- 
-- Dữ liệu bao gồm:
-- - Users (admin, employees, customers)
-- - Employees
-- - Customers
-- - Products (với nhiều loại để test filter)
-- - Purchase Orders (đơn nhập hàng)
-- - Purchase Order Details
-- - Inventory Transactions
-- 
-- Lưu ý:
-- - Password mặc định cho tất cả users: "123456"
-- - Password được hash bằng BCrypt (strength 12)
-- - BCrypt hash của "123456": $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LS2J5q5Q5Q5q
-- - Nếu chạy lại script, sử dụng INSERT IGNORE hoặc ON DUPLICATE KEY UPDATE
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- SEED DATA: Users (trước khi tạo employees và customers)
-- ============================================================
-- Password: "123456" (BCrypt hash với strength 12)
-- 
-- LƯU Ý QUAN TRỌNG: BCrypt hash được generate tự động khi user đăng ký qua API
-- Nếu insert trực tiếp vào database, cần generate hash trước:
-- 
-- Cách 1: Sử dụng Java code:
--   BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
--   String hash = encoder.encode("123456");
--   System.out.println(hash);
--
-- Cách 2: Sử dụng online tool: https://bcrypt-generator.com/
--   - Rounds: 12
--   - Plain text: 123456
--   - Copy hash và paste vào đây
--
-- Hash mẫu cho "123456" (đã được generate):
-- $2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
--
-- Nếu hash này không hoạt động, hãy generate hash mới bằng một trong các cách trên

INSERT INTO users (username, password, email, role, is_active) VALUES
-- Admin user (đã được tạo bởi AppInitConfig, nhưng thêm để đảm bảo)
('admin', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin@store.com', 'ADMIN', 1),

-- Employee users
('employee1', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'employee1@store.com', 'EMPLOYEE', 1),
('employee2', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'employee2@store.com', 'EMPLOYEE', 1),
('employee3', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'employee3@store.com', 'EMPLOYEE', 1),

-- Customer users
('customer1', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'customer1@gmail.com', 'CUSTOMER', 1),
('customer2', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'customer2@gmail.com', 'CUSTOMER', 1),
('customer3', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'customer3@gmail.com', 'CUSTOMER', 1),
('customer_vip', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'customer_vip@gmail.com', 'CUSTOMER', 1)
ON DUPLICATE KEY UPDATE username = username;

-- ============================================================
-- SEED DATA: Employees
-- ============================================================
INSERT INTO employees (id_user, employee_name, hire_date, phone_number, address, base_salary) VALUES
((SELECT id_user FROM users WHERE username = 'employee1'), 'Nguyễn Văn A', '2024-01-15', '0912345678', '123 Đường ABC, Quận 1, TP.HCM', 15000000),
((SELECT id_user FROM users WHERE username = 'employee2'), 'Trần Thị B', '2024-02-20', '0923456789', '456 Đường XYZ, Quận 2, TP.HCM', 12000000),
((SELECT id_user FROM users WHERE username = 'employee3'), 'Lê Văn C', '2024-03-10', '0934567890', '789 Đường DEF, Quận 3, TP.HCM', 18000000)
ON DUPLICATE KEY UPDATE employee_name = employee_name;

-- ============================================================
-- SEED DATA: Customers
-- ============================================================
INSERT INTO customers (id_user, customer_name, phone_number, address, customer_type) VALUES
((SELECT id_user FROM users WHERE username = 'customer1'), 'Phạm Văn D', '0945678901', '101 Đường GHI, Quận 4, TP.HCM', 'REGULAR'),
((SELECT id_user FROM users WHERE username = 'customer2'), 'Hoàng Thị E', '0956789012', '202 Đường JKL, Quận 5, TP.HCM', 'REGULAR'),
((SELECT id_user FROM users WHERE username = 'customer3'), 'Võ Văn F', '0967890123', '303 Đường MNO, Quận 6, TP.HCM', 'REGULAR'),
((SELECT id_user FROM users WHERE username = 'customer_vip'), 'Đặng Thị G', '0978901234', '404 Đường PQR, Quận 7, TP.HCM', 'VIP')
ON DUPLICATE KEY UPDATE customer_name = customer_name;

-- ============================================================
-- SEED DATA: Products
-- ============================================================
-- Lưu ý: Categories và Suppliers đã được seed trong V2
-- ID categories: 1=Điện thoại, 2=Laptop, 3=Tablet, 4=Phụ kiện, 5=Đồng hồ thông minh
-- ID suppliers: 1=Apple, 2=Samsung, 3=Xiaomi, 4=HP, 5=Dell

INSERT INTO products (id_category, id_supplier, product_name, brand, description, price, stock_quantity, status, product_code, code_type, sku) VALUES
-- Điện thoại (Category 1)
(1, 1, 'iPhone 15 Pro', 'Apple', 'Điện thoại cao cấp với chip A17 Pro, camera 48MP', 25000000, 50, 'IN_STOCK', 'IP15PRO-001', 'SKU', 'DT-001'),
(1, 1, 'iPhone 14', 'Apple', 'Điện thoại với chip A15 Bionic', 18000000, 30, 'IN_STOCK', 'IP14-001', 'SKU', 'DT-002'),
(1, 2, 'Samsung Galaxy S24 Ultra', 'Samsung', 'Điện thoại flagship với S Pen', 28000000, 25, 'IN_STOCK', 'SGS24U-001', 'SKU', 'DT-003'),
(1, 2, 'Samsung Galaxy A54', 'Samsung', 'Điện thoại tầm trung', 8000000, 100, 'IN_STOCK', 'SGA54-001', 'SKU', 'DT-004'),
(1, 3, 'Xiaomi 14 Pro', 'Xiaomi', 'Điện thoại với camera Leica', 15000000, 40, 'IN_STOCK', 'XMI14P-001', 'SKU', 'DT-005'),
(1, 3, 'Redmi Note 13', 'Xiaomi', 'Điện thoại giá rẻ hiệu năng tốt', 5000000, 150, 'IN_STOCK', 'RMN13-001', 'SKU', 'DT-006'),

-- Laptop (Category 2)
(2, 4, 'HP Pavilion 15', 'HP', 'Laptop 15 inch, Intel Core i5, 8GB RAM', 15000000, 20, 'IN_STOCK', 'HPPAV15-001', 'SKU', 'LT-001'),
(2, 4, 'HP EliteBook X360', 'HP', 'Laptop 2-in-1, Intel Core i7, 16GB RAM', 25000000, 15, 'IN_STOCK', 'HPELB-001', 'SKU', 'LT-002'),
(2, 5, 'Dell XPS 13', 'Dell', 'Laptop cao cấp, Intel Core i7, 16GB RAM, SSD 512GB', 30000000, 10, 'IN_STOCK', 'DLXPS13-001', 'SKU', 'LT-003'),
(2, 5, 'Dell Inspiron 15', 'Dell', 'Laptop 15 inch, Intel Core i5, 8GB RAM', 12000000, 30, 'IN_STOCK', 'DLINS15-001', 'SKU', 'LT-004'),
(2, 1, 'MacBook Pro 14', 'Apple', 'Laptop Apple với chip M3 Pro, 16GB RAM', 45000000, 8, 'IN_STOCK', 'MBP14-001', 'SKU', 'LT-005'),
(2, 1, 'MacBook Air M2', 'Apple', 'Laptop mỏng nhẹ với chip M2, 8GB RAM', 25000000, 12, 'IN_STOCK', 'MBA-M2-001', 'SKU', 'LT-006'),

-- Tablet (Category 3)
(3, 1, 'iPad Pro 12.9 inch', 'Apple', 'Tablet cao cấp với chip M2, 12.9 inch', 28000000, 15, 'IN_STOCK', 'IPDP12-001', 'SKU', 'TB-001'),
(3, 1, 'iPad Air', 'Apple', 'Tablet tầm trung với chip M1', 15000000, 25, 'IN_STOCK', 'IPDA-001', 'SKU', 'TB-002'),
(3, 2, 'Samsung Galaxy Tab S9', 'Samsung', 'Tablet Android cao cấp với S Pen', 20000000, 18, 'IN_STOCK', 'SGTABS9-001', 'SKU', 'TB-003'),

-- Phụ kiện (Category 4)
(4, 1, 'AirPods Pro 2', 'Apple', 'Tai nghe không dây chống ồn chủ động', 6000000, 100, 'IN_STOCK', 'APDP2-001', 'SKU', 'PK-001'),
(4, 2, 'Galaxy Buds2 Pro', 'Samsung', 'Tai nghe không dây Samsung', 4000000, 80, 'IN_STOCK', 'SGBUDS2-001', 'SKU', 'PK-002'),
(4, NULL, 'Ốp lưng iPhone 15 Pro', 'Generic', 'Ốp lưng trong suốt bảo vệ iPhone', 200000, 200, 'IN_STOCK', 'OPIP15-001', 'SKU', 'PK-003'),
(4, NULL, 'Cáp sạc USB-C', 'Generic', 'Cáp sạc nhanh USB-C 2m', 150000, 300, 'IN_STOCK', 'CAPUSBC-001', 'SKU', 'PK-004'),

-- Đồng hồ thông minh (Category 5)
(5, 1, 'Apple Watch Series 9', 'Apple', 'Đồng hồ thông minh Apple, 45mm', 12000000, 30, 'IN_STOCK', 'AW9-001', 'SKU', 'DH-001'),
(5, 2, 'Samsung Galaxy Watch 6', 'Samsung', 'Đồng hồ thông minh Samsung, 44mm', 8000000, 40, 'IN_STOCK', 'SGW6-001', 'SKU', 'DH-002'),

-- Sản phẩm hết hàng để test OUT_OF_STOCK
(1, 1, 'iPhone 13 Pro (Hết hàng)', 'Apple', 'Điện thoại đã ngừng sản xuất', 20000000, 0, 'OUT_OF_STOCK', 'IP13PRO-001', 'SKU', 'DT-007')
ON DUPLICATE KEY UPDATE product_name = product_name;

-- ============================================================
-- SEED DATA: Purchase Orders (Đơn nhập hàng)
-- ============================================================
-- Lưu ý: id_employee được lưu dưới dạng integer, không phải foreign key
-- Sử dụng ID của employees đã tạo ở trên

INSERT INTO purchase_orders (id_supplier, id_employee, order_date, total_amount) VALUES
(1, 1, '2025-01-05 10:00:00', 500000000.00),  -- Đơn nhập từ Apple
(2, 1, '2025-01-10 14:30:00', 320000000.00),  -- Đơn nhập từ Samsung
(1, 2, '2025-01-15 09:15:00', 750000000.00),  -- Đơn nhập từ Apple (employee 2)
(3, 2, '2025-01-20 11:00:00', 150000000.00),  -- Đơn nhập từ Xiaomi
(4, 3, '2025-01-25 15:45:00', 450000000.00)   -- Đơn nhập từ HP
ON DUPLICATE KEY UPDATE total_amount = total_amount;

-- ============================================================
-- SEED DATA: Purchase Order Details
-- ============================================================
-- 
-- LƯU Ý: id_product trong script này giả định products được insert theo thứ tự
-- và có ID từ 1 đến 22. Nếu database đã có products khác, cần điều chỉnh ID.
-- 
-- Để kiểm tra ID products thực tế:
-- SELECT id_product, product_code, product_name FROM products ORDER BY id_product;
--
-- Đơn nhập hàng #1: Từ Apple (iPhone, iPad, MacBook)
INSERT INTO purchase_order_details (id_purchase_order, id_product, quantity, import_price) VALUES
(1, (SELECT id_product FROM products WHERE product_code = 'IP15PRO-001' LIMIT 1), 20, 20000000.00),  -- iPhone 15 Pro: 20 cái, giá nhập 20tr
(1, (SELECT id_product FROM products WHERE product_code = 'IP14-001' LIMIT 1), 15, 15000000.00),  -- iPhone 14: 15 cái, giá nhập 15tr
(1, (SELECT id_product FROM products WHERE product_code = 'MBP14-001' LIMIT 1), 5, 38000000.00),  -- MacBook Pro 14: 5 cái, giá nhập 38tr
(1, (SELECT id_product FROM products WHERE product_code = 'MBA-M2-001' LIMIT 1), 10, 20000000.00), -- MacBook Air M2: 10 cái, giá nhập 20tr
(1, (SELECT id_product FROM products WHERE product_code = 'IPDP12-001' LIMIT 1), 8, 22000000.00),  -- iPad Pro 12.9: 8 cái, giá nhập 22tr
(1, (SELECT id_product FROM products WHERE product_code = 'APDP2-001' LIMIT 1), 50, 4500000.00)   -- AirPods Pro 2: 50 cái, giá nhập 4.5tr
ON DUPLICATE KEY UPDATE quantity = quantity;

-- Đơn nhập hàng #2: Từ Samsung
INSERT INTO purchase_order_details (id_purchase_order, id_product, quantity, import_price) VALUES
(2, (SELECT id_product FROM products WHERE product_code = 'SGS24U-001' LIMIT 1), 12, 24000000.00),  -- Galaxy S24 Ultra: 12 cái, giá nhập 24tr
(2, (SELECT id_product FROM products WHERE product_code = 'SGA54-001' LIMIT 1), 50, 6500000.00),   -- Galaxy A54: 50 cái, giá nhập 6.5tr
(2, (SELECT id_product FROM products WHERE product_code = 'SGTABS9-001' LIMIT 1), 10, 16000000.00), -- Galaxy Tab S9: 10 cái, giá nhập 16tr
(2, (SELECT id_product FROM products WHERE product_code = 'SGW6-001' LIMIT 1), 30, 6500000.00),  -- Galaxy Watch 6: 30 cái, giá nhập 6.5tr
(2, (SELECT id_product FROM products WHERE product_code = 'SGBUDS2-001' LIMIT 1), 40, 3200000.00)   -- Galaxy Buds2 Pro: 40 cái, giá nhập 3.2tr
ON DUPLICATE KEY UPDATE quantity = quantity;

-- Đơn nhập hàng #3: Từ Apple (lần 2)
INSERT INTO purchase_order_details (id_purchase_order, id_product, quantity, import_price) VALUES
(3, (SELECT id_product FROM products WHERE product_code = 'IP15PRO-001' LIMIT 1), 30, 20000000.00),  -- iPhone 15 Pro: 30 cái
(3, (SELECT id_product FROM products WHERE product_code = 'IPDP12-001' LIMIT 1), 12, 22000000.00), -- iPad Pro 12.9: 12 cái
(3, (SELECT id_product FROM products WHERE product_code = 'IPDA-001' LIMIT 1), 20, 12000000.00), -- iPad Air: 20 cái
(3, (SELECT id_product FROM products WHERE product_code = 'APDP2-001' LIMIT 1), 80, 4500000.00),  -- AirPods Pro 2: 80 cái
(3, (SELECT id_product FROM products WHERE product_code = 'AW9-001' LIMIT 1), 25, 9500000.00)   -- Apple Watch Series 9: 25 cái, giá nhập 9.5tr
ON DUPLICATE KEY UPDATE quantity = quantity;

-- Đơn nhập hàng #4: Từ Xiaomi
INSERT INTO purchase_order_details (id_purchase_order, id_product, quantity, import_price) VALUES
(4, (SELECT id_product FROM products WHERE product_code = 'XMI14P-001' LIMIT 1), 20, 12000000.00),  -- Xiaomi 14 Pro: 20 cái, giá nhập 12tr
(4, (SELECT id_product FROM products WHERE product_code = 'RMN13-001' LIMIT 1), 60, 4000000.00)    -- Redmi Note 13: 60 cái, giá nhập 4tr
ON DUPLICATE KEY UPDATE quantity = quantity;

-- Đơn nhập hàng #5: Từ HP
INSERT INTO purchase_order_details (id_purchase_order, id_product, quantity, import_price) VALUES
(5, (SELECT id_product FROM products WHERE product_code = 'HPPAV15-001' LIMIT 1), 10, 12000000.00),  -- HP Pavilion 15: 10 cái, giá nhập 12tr
(5, (SELECT id_product FROM products WHERE product_code = 'HPELB-001' LIMIT 1), 8, 20000000.00)     -- HP EliteBook X360: 8 cái, giá nhập 20tr
ON DUPLICATE KEY UPDATE quantity = quantity;

-- ============================================================
-- SEED DATA: Inventory Transactions
-- ============================================================
-- Tạo inventory transactions cho các đơn nhập hàng ở trên
-- Mỗi purchase order detail sẽ tạo 1 transaction type IN
-- 
-- Lưu ý: Sử dụng product_code để lấy id_product (đảm bảo đúng product)

-- Transactions cho đơn nhập hàng #1
INSERT INTO inventory_transactions (id_product, transaction_type, quantity, reference_type, reference_id, id_employee, notes, transaction_date) VALUES
((SELECT id_product FROM products WHERE product_code = 'IP15PRO-001' LIMIT 1), 'IN', 20, 'PURCHASE_ORDER', 1, 1, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1', '2025-01-05 10:00:00'),
((SELECT id_product FROM products WHERE product_code = 'IP14-001' LIMIT 1), 'IN', 15, 'PURCHASE_ORDER', 1, 1, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1', '2025-01-05 10:00:00'),
((SELECT id_product FROM products WHERE product_code = 'MBP14-001' LIMIT 1), 'IN', 5, 'PURCHASE_ORDER', 1, 1, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1', '2025-01-05 10:00:00'),
((SELECT id_product FROM products WHERE product_code = 'MBA-M2-001' LIMIT 1), 'IN', 10, 'PURCHASE_ORDER', 1, 1, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1', '2025-01-05 10:00:00'),
((SELECT id_product FROM products WHERE product_code = 'IPDP12-001' LIMIT 1), 'IN', 8, 'PURCHASE_ORDER', 1, 1, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1', '2025-01-05 10:00:00'),
((SELECT id_product FROM products WHERE product_code = 'APDP2-001' LIMIT 1), 'IN', 50, 'PURCHASE_ORDER', 1, 1, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #1', '2025-01-05 10:00:00'),

-- Transactions cho đơn nhập hàng #2
((SELECT id_product FROM products WHERE product_code = 'SGS24U-001' LIMIT 1), 'IN', 12, 'PURCHASE_ORDER', 2, 1, 'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2', '2025-01-10 14:30:00'),
((SELECT id_product FROM products WHERE product_code = 'SGA54-001' LIMIT 1), 'IN', 50, 'PURCHASE_ORDER', 2, 1, 'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2', '2025-01-10 14:30:00'),
((SELECT id_product FROM products WHERE product_code = 'SGTABS9-001' LIMIT 1), 'IN', 10, 'PURCHASE_ORDER', 2, 1, 'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2', '2025-01-10 14:30:00'),
((SELECT id_product FROM products WHERE product_code = 'SGW6-001' LIMIT 1), 'IN', 30, 'PURCHASE_ORDER', 2, 1, 'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2', '2025-01-10 14:30:00'),
((SELECT id_product FROM products WHERE product_code = 'SGBUDS2-001' LIMIT 1), 'IN', 40, 'PURCHASE_ORDER', 2, 1, 'Nhập hàng từ NCC Samsung Electronics - Đơn nhập #2', '2025-01-10 14:30:00'),

-- Transactions cho đơn nhập hàng #3
((SELECT id_product FROM products WHERE product_code = 'IP15PRO-001' LIMIT 1), 'IN', 30, 'PURCHASE_ORDER', 3, 2, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3', '2025-01-15 09:15:00'),
((SELECT id_product FROM products WHERE product_code = 'IPDP12-001' LIMIT 1), 'IN', 12, 'PURCHASE_ORDER', 3, 2, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3', '2025-01-15 09:15:00'),
((SELECT id_product FROM products WHERE product_code = 'IPDA-001' LIMIT 1), 'IN', 20, 'PURCHASE_ORDER', 3, 2, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3', '2025-01-15 09:15:00'),
((SELECT id_product FROM products WHERE product_code = 'APDP2-001' LIMIT 1), 'IN', 80, 'PURCHASE_ORDER', 3, 2, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3', '2025-01-15 09:15:00'),
((SELECT id_product FROM products WHERE product_code = 'AW9-001' LIMIT 1), 'IN', 25, 'PURCHASE_ORDER', 3, 2, 'Nhập hàng từ NCC Apple Inc. - Đơn nhập #3', '2025-01-15 09:15:00'),

-- Transactions cho đơn nhập hàng #4
((SELECT id_product FROM products WHERE product_code = 'XMI14P-001' LIMIT 1), 'IN', 20, 'PURCHASE_ORDER', 4, 2, 'Nhập hàng từ NCC Xiaomi Corporation - Đơn nhập #4', '2025-01-20 11:00:00'),
((SELECT id_product FROM products WHERE product_code = 'RMN13-001' LIMIT 1), 'IN', 60, 'PURCHASE_ORDER', 4, 2, 'Nhập hàng từ NCC Xiaomi Corporation - Đơn nhập #4', '2025-01-20 11:00:00'),

-- Transactions cho đơn nhập hàng #5
((SELECT id_product FROM products WHERE product_code = 'HPPAV15-001' LIMIT 1), 'IN', 10, 'PURCHASE_ORDER', 5, 3, 'Nhập hàng từ NCC HP Inc. - Đơn nhập #5', '2025-01-25 15:45:00'),
((SELECT id_product FROM products WHERE product_code = 'HPELB-001' LIMIT 1), 'IN', 8, 'PURCHASE_ORDER', 5, 3, 'Nhập hàng từ NCC HP Inc. - Đơn nhập #5', '2025-01-25 15:45:00');

-- ============================================================
-- CẬP NHẬT STOCK QUANTITY CHO PRODUCTS
-- ============================================================
-- 
-- Lưu ý quan trọng:
-- - Trong thực tế, khi tạo đơn nhập hàng qua API, ImportOrderService sẽ tự động:
--   1. Cập nhật stock_quantity của product (tăng)
--   2. Tạo inventory_transaction (type: IN)
--   3. Cập nhật product status nếu cần
-- 
-- - Trong script SQL này, chúng ta insert trực tiếp vào database, nên cần:
--   1. Insert inventory_transactions trước
--   2. Tính lại stock_quantity từ tổng các transactions IN
--   3. Cập nhật product status
-- 
-- Logic tính stock_quantity:
-- - Lấy tổng số lượng từ tất cả inventory_transactions có type = 'IN'
-- - Cập nhật vào stock_quantity của product
-- - Nếu stock_quantity = 0 -> status = 'OUT_OF_STOCK'

UPDATE products SET stock_quantity = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM inventory_transactions
    WHERE inventory_transactions.id_product = products.id_product
    AND transaction_type = 'IN'
) WHERE id_product IN (
    SELECT DISTINCT id_product FROM inventory_transactions WHERE transaction_type = 'IN'
);

-- Cập nhật status cho products có stock = 0
UPDATE products SET status = 'OUT_OF_STOCK' WHERE stock_quantity = 0;

-- Cập nhật status cho products có stock > 0 nhưng status = OUT_OF_STOCK
UPDATE products SET status = 'IN_STOCK' WHERE stock_quantity > 0 AND status = 'OUT_OF_STOCK';

-- ============================================================
-- GHI CHÚ VỀ DỮ LIỆU MẪU
-- ============================================================
-- 
-- 1. USERS:
--    - Tất cả users có password: "123456"
--    - Admin: admin / 123456
--    - Employees: employee1, employee2, employee3 / 123456
--    - Customers: customer1, customer2, customer3, customer_vip / 123456
--
-- 2. PRODUCTS:
--    - Có đủ các loại để test filter:
--      + Theo category (Điện thoại, Laptop, Tablet, Phụ kiện, Đồng hồ)
--      + Theo brand (Apple, Samsung, Xiaomi, HP, Dell)
--      + Theo supplier (các nhà cung cấp khác nhau)
--      + Theo price range (từ 150k đến 45tr)
--      + Theo status (IN_STOCK, OUT_OF_STOCK)
--
-- 3. PURCHASE ORDERS:
--    - 5 đơn nhập hàng từ các suppliers khác nhau
--    - Tạo bởi các employees khác nhau
--    - Có đủ dữ liệu để test:
--      + Lấy danh sách đơn nhập hàng
--      + Lọc theo supplier
--      + Lọc theo thời gian
--      + Xuất PDF
--
-- 4. INVENTORY TRANSACTIONS:
--    - Tất cả transactions là type IN (nhập kho)
--    - Reference type: PURCHASE_ORDER
--    - Có đủ dữ liệu để test:
--      + Lấy lịch sử nhập/xuất kho
--      + Lọc theo product
--      + Lọc theo reference
--      + Lọc theo thời gian
--
-- 5. STOCK QUANTITY:
--    - Đã được cập nhật tự động từ inventory transactions
--    - Một số sản phẩm có stock > 0, một số = 0 (OUT_OF_STOCK)
--
-- ============================================================
-- HƯỚNG DẪN SỬ DỤNG
-- ============================================================
-- 
-- 1. Chạy script này sau khi đã chạy V1 và V2
-- 2. Script sử dụng ON DUPLICATE KEY UPDATE để tránh lỗi khi chạy lại
-- 3. Nếu muốn reset dữ liệu, xóa các bản ghi trước khi chạy lại
-- 4. Để test các chức năng:
--    - Login với admin/employee/customer
--    - Test CRUD operations
--    - Test filter và search
--    - Test import orders
--    - Test inventory transactions
--
-- ============================================================

