-- Seed Data cho Testing
-- Chạy file này sau khi import init_manage_store.sql

USE `quanly_banhang`;

-- 1. Tạo User accounts
-- Password cho tất cả: "password123" (đã được mã hóa bằng BCrypt)
INSERT INTO `users` (`username`, `password`, `email`, `role`, `is_active`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye7IK0bgPqFECYZgDaElXYPqkYCXt9I9y', 'admin@store.com', 'ADMIN', 1),
('nhanvien1', '$2a$10$N9qo8uLOickgx2ZMRZoMye7IK0bgPqFECYZgDaElXYPqkYCXt9I9y', 'nv1@store.com', 'EMPLOYEE', 1),
('nhanvien2', '$2a$10$N9qo8uLOickgx2ZMRZoMye7IK0bgPqFECYZgDaElXYPqkYCXt9I9y', 'nv2@store.com', 'EMPLOYEE', 1),
('customer1', '$2a$10$N9qo8uLOickgx2ZMRZoMye7IK0bgPqFECYZgDaElXYPqkYCXt9I9y', 'customer1@gmail.com', 'CUSTOMER', 1),
('customer2', '$2a$10$N9qo8uLOickgx2ZMRZoMye7IK0bgPqFECYZgDaElXYPqkYCXt9I9y', 'customer2@gmail.com', 'CUSTOMER', 1);

-- 2. Tạo Employees
INSERT INTO `employees` (`id_user`, `employee_name`, `hire_date`, `phone_number`, `address`, `base_salary`) VALUES
(1, 'Nguyễn Văn Admin', '2023-01-01', '0901234567', '123 Nguyễn Trãi, Hà Nội', 20000000.00),
(2, 'Trần Thị Nhân Viên', '2023-06-15', '0912345678', '456 Lê Lợi, Hà Nội', 12000000.00),
(3, 'Lê Văn Bán Hàng', '2024-01-10', '0923456789', '789 Trần Phú, Hà Nội', 10000000.00);

-- 3. Tạo Customers
INSERT INTO `customers` (`id_user`, `customer_name`, `address`, `phone_number`, `customer_type`) VALUES
(4, 'Phạm Thị Khách Hàng', '111 Hoàng Diệu, Hà Nội', '0934567890', 'VIP'),
(5, 'Hoàng Văn Mua', '222 Hai Bà Trưng, Hà Nội', '0945678901', 'REGULAR'),
(NULL, 'Nguyễn Thị Lan', '333 Bà Triệu, Hà Nội', '0956789012', 'VIP'),
(NULL, 'Đặng Văn Hùng', '444 Lý Thường Kiệt, Hà Nội', '0967890123', 'REGULAR');

-- 4. Tạo Categories
INSERT INTO `categories` (`category_name`) VALUES
('Điện thoại'),
('Laptop'),
('Tablet'),
('Phụ kiện'),
('Đồng hồ thông minh');

-- 5. Tạo Products
INSERT INTO `products` (`id_category`, `product_name`, `description`, `price`, `stock_quantity`, `status`, `image_url`) VALUES
(1, 'iPhone 15 Pro Max 256GB', 'Điện thoại cao cấp từ Apple', 29990000.00, 50, 'available', 'https://example.com/iphone15.jpg'),
(1, 'Samsung Galaxy S24 Ultra', 'Flagship Android mới nhất', 27990000.00, 40, 'available', 'https://example.com/s24.jpg'),
(1, 'Xiaomi 14 Pro', 'Điện thoại hiệu năng cao', 18990000.00, 30, 'available', 'https://example.com/mi14.jpg'),
(2, 'MacBook Pro M3 14 inch', 'Laptop cho dân chuyên nghiệp', 52990000.00, 20, 'available', 'https://example.com/mbp.jpg'),
(2, 'Dell XPS 15', 'Laptop Windows cao cấp', 45990000.00, 15, 'available', 'https://example.com/xps15.jpg'),
(2, 'ASUS ROG Zephyrus G14', 'Laptop gaming mỏng nhẹ', 38990000.00, 8, 'available', 'https://example.com/rog.jpg'),
(3, 'iPad Pro 12.9 inch M2', 'Máy tính bảng cao cấp', 32990000.00, 25, 'available', 'https://example.com/ipad.jpg'),
(3, 'Samsung Galaxy Tab S9', 'Tablet Android premium', 22990000.00, 20, 'available', 'https://example.com/tabs9.jpg'),
(4, 'AirPods Pro 2', 'Tai nghe không dây từ Apple', 6490000.00, 100, 'available', 'https://example.com/airpods.jpg'),
(4, 'Apple Pencil 2', 'Bút cảm ứng cho iPad', 3490000.00, 5, 'available', 'https://example.com/pencil.jpg'),
(5, 'Apple Watch Series 9', 'Đồng hồ thông minh', 10990000.00, 35, 'available', 'https://example.com/watch.jpg'),
(5, 'Samsung Galaxy Watch 6', 'Smartwatch Android', 7990000.00, 30, 'available', 'https://example.com/galaxywatch.jpg');

-- 6. Tạo Suppliers
INSERT INTO `suppliers` (`supplier_name`, `address`, `phone_number`, `email`) VALUES
('Apple Vietnam', 'Singapore', '0281234567', 'contact@apple.vn'),
('Samsung Vietnam', 'Bắc Ninh, Việt Nam', '0282345678', 'info@samsung.vn'),
('Xiaomi Vietnam', 'Hà Nội, Việt Nam', '0283456789', 'support@xiaomi.vn'),
('Dell Vietnam', 'TP.HCM, Việt Nam', '0284567890', 'sales@dell.vn'),
('ASUS Vietnam', 'TP.HCM, Việt Nam', '0285678901', 'contact@asus.vn');

-- 7. Tạo một số Orders mẫu
INSERT INTO `orders` (`id_customer`, `id_employee`, `order_date`, `status`, `total_amount`, `payment_method`, `discount`, `notes`) VALUES
(1, 1, '2024-01-15 10:30:00', 'COMPLETED', 30000000.00, 'TRANSFER', 500000.00, 'Khách hàng VIP - giảm giá 500k'),
(2, 2, '2024-01-20 14:15:00', 'COMPLETED', 18990000.00, 'CASH', 0.00, 'Thanh toán tiền mặt'),
(3, 2, '2024-01-25 16:45:00', 'PENDING', 52990000.00, 'TRANSFER', 0.00, 'Đơn hàng đang xử lý'),
(1, 3, '2024-02-01 09:20:00', 'COMPLETED', 13480000.00, 'TRANSFER', 0.00, 'Mua combo tai nghe + bút'),
(4, 1, '2024-02-10 11:00:00', 'CONFIRMED', 75980000.00, 'TRANSFER', 1000000.00, 'Mua nhiều sản phẩm');

-- 8. Tạo Order Details
INSERT INTO `order_details` (`id_order`, `id_product`, `quantity`, `price`) VALUES
-- Order 1
(1, 1, 1, 29990000.00),
-- Order 2
(2, 3, 1, 18990000.00),
-- Order 3
(3, 4, 1, 52990000.00),
-- Order 4
(4, 9, 2, 6490000.00),
(4, 10, 1, 3490000.00),
-- Order 5
(5, 2, 1, 27990000.00),
(5, 7, 1, 32990000.00),
(5, 11, 1, 10990000.00);

-- 9. Tạo Purchase Orders (Đơn nhập hàng)
INSERT INTO `purchase_orders` (`id_supplier`, `id_employee`, `order_date`, `total_amount`) VALUES
(1, 1, '2024-01-05 08:00:00', 150000000.00),
(2, 1, '2024-01-10 10:00:00', 120000000.00),
(3, 2, '2024-01-15 14:30:00', 80000000.00);

-- 10. Tạo Purchase Order Details
INSERT INTO `purchase_order_details` (`id_purchase_order`, `id_product`, `quantity`, `import_price`) VALUES
-- Purchase Order 1 (Apple products)
(1, 1, 30, 25000000.00),
(1, 9, 50, 5500000.00),
-- Purchase Order 2 (Samsung products)
(2, 2, 25, 23000000.00),
(2, 8, 20, 19000000.00),
-- Purchase Order 3 (Xiaomi products)
(3, 3, 40, 15000000.00);

-- 11. Tạo Inventory Transactions
INSERT INTO `inventory_transactions` (`id_product`, `transaction_type`, `quantity`, `reference_type`, `reference_id`, `transaction_date`, `id_employee`, `notes`) VALUES
-- Nhập kho từ purchase orders
(1, 'IN', 30, 'PURCHASE_ORDER', 1, '2024-01-05 09:00:00', 1, 'Nhập hàng iPhone 15 Pro Max'),
(9, 'IN', 50, 'PURCHASE_ORDER', 1, '2024-01-05 09:30:00', 1, 'Nhập hàng AirPods Pro 2'),
(2, 'IN', 25, 'PURCHASE_ORDER', 2, '2024-01-10 11:00:00', 1, 'Nhập hàng Samsung Galaxy S24'),
-- Xuất kho từ đơn hàng
(1, 'OUT', 1, 'SALE_ORDER', 1, '2024-01-15 10:30:00', 1, 'Bán cho khách VIP'),
(3, 'OUT', 1, 'SALE_ORDER', 2, '2024-01-20 14:15:00', 2, 'Bán Xiaomi 14 Pro');

-- 12. Tạo Carts cho khách hàng
INSERT INTO `carts` (`id_customer`) VALUES
(1),
(2);

-- 13. Tạo Cart Items
INSERT INTO `cart_items` (`id_cart`, `id_product`, `quantity`) VALUES
(1, 5, 1),
(1, 11, 1),
(2, 3, 1),
(2, 9, 2);

-- 14. Tạo Shipments
INSERT INTO `shipments` (`id_order`, `shipping_status`, `tracking_number`, `location_lat`, `location_long`) VALUES
(1, 'DELIVERED', 'TRK001234567', 21.028511, 105.804817),
(2, 'DELIVERED', 'TRK001234568', 21.028511, 105.804817),
(3, 'PREPARING', 'TRK001234569', NULL, NULL),
(4, 'DELIVERED', 'TRK001234570', 21.028511, 105.804817),
(5, 'SHIPPED', 'TRK001234571', 20.980571, 105.787166);

-- Verify data
SELECT 'Users created:' as 'Info', COUNT(*) as 'Count' FROM users
UNION ALL
SELECT 'Employees:', COUNT(*) FROM employees
UNION ALL
SELECT 'Customers:', COUNT(*) FROM customers
UNION ALL
SELECT 'Categories:', COUNT(*) FROM categories
UNION ALL
SELECT 'Products:', COUNT(*) FROM products
UNION ALL
SELECT 'Suppliers:', COUNT(*) FROM suppliers
UNION ALL
SELECT 'Orders:', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Details:', COUNT(*) FROM order_details
UNION ALL
SELECT 'Purchase Orders:', COUNT(*) FROM purchase_orders
UNION ALL
SELECT 'Inventory Transactions:', COUNT(*) FROM inventory_transactions;

-- Display sample data
SELECT '=== Sample Users ===' as '';
SELECT id_user, username, email, role FROM users LIMIT 5;

SELECT '=== Sample Products ===' as '';
SELECT p.id_product, p.product_name, c.category_name, p.price, p.stock_quantity 
FROM products p 
LEFT JOIN categories c ON p.id_category = c.id_category 
LIMIT 5;

SELECT '=== Sample Orders ===' as '';
SELECT o.id_order, c.customer_name, e.employee_name, o.order_date, o.status, o.total_amount
FROM orders o
LEFT JOIN customers c ON o.id_customer = c.id_customer
LEFT JOIN employees e ON o.id_employee = e.id_employee
LIMIT 5;

-- Default password for all users: password123
