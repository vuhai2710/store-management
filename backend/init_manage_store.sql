-- Tạo và sử dụng database
CREATE DATABASE `quanly_banhang`;  
USE `quanly_banhang`;

-- Thiết lập bộ ký tự
SET NAMES utf8mb4;

--
-- Bảng `users`
-- MÔ TẢ: Quản lý tài khoản đăng nhập (Admin, Nhân viên, Khách hàng)
--
CREATE TABLE `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Lưu mật khẩu đã mã hóa',
  `email` varchar(255) NOT NULL,
  `role` enum('ADMIN','EMPLOYEE','CUSTOMER') NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `customers`
-- MÔ TẢ: Lưu thông tin hồ sơ khách hàng. Liên kết với bảng `users` để xác thực
--
CREATE TABLE `customers` (
  `id_customer` int NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL COMMENT 'Foreign key tới bảng users',
  `customer_name` varchar(255) NOT NULL,
  `address` text,
  `phone_number` varchar(20) DEFAULT NULL,
  `customer_type` enum('VIP','REGULAR') DEFAULT 'REGULAR' COMMENT 'Phân loại khách hàng',
  PRIMARY KEY (`id_customer`),
  UNIQUE KEY `id_user` (`id_user`),
  CONSTRAINT `customers_fk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `employees`
-- MÔ TẢ: Lưu thông tin hồ sơ nhân viên. Các trường xác thực đã chuyển sang bảng `users`
--
CREATE TABLE `employees` (
  `id_employee` int NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL COMMENT 'Foreign key tới bảng users',
  `employee_name` varchar(255) NOT NULL,
  `hire_date` date DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text,
  `base_salary` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id_employee`),
  UNIQUE KEY `id_user` (`id_user`),
  CONSTRAINT `employees_fk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `categories`
--
CREATE TABLE `categories` (
  `id_category` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `products`
--
CREATE TABLE `products` (
  `id_product` int NOT NULL AUTO_INCREMENT,
  `id_category` int DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(12,2) NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `status` varchar(50) DEFAULT 'available' COMMENT 'Trạng thái: available, out_of_stock, discontinued',
  `image_url` varchar(500) DEFAULT NULL COMMENT 'Hình ảnh sản phẩm',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_product`),
  KEY `id_category` (`id_category`),
  CONSTRAINT `products_fk_1` FOREIGN KEY (`id_category`) REFERENCES `categories` (`id_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `suppliers`
--
CREATE TABLE `suppliers` (
  `id_supplier` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) NOT NULL,
  `address` text,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_supplier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `carts`
-- MÔ TẢ: Giỏ hàng của khách hàng
--
CREATE TABLE `carts` (
  `id_cart` int NOT NULL AUTO_INCREMENT,
  `id_customer` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cart`),
  UNIQUE KEY `id_customer` (`id_customer`),
  CONSTRAINT `carts_fk_1` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id_customer`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `cart_items`
-- MÔ TẢ: Các sản phẩm trong giỏ hàng
--
CREATE TABLE `cart_items` (
  `id_cart_item` int NOT NULL AUTO_INCREMENT,
  `id_cart` int NOT NULL,
  `id_product` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cart_item`),
  KEY `id_cart` (`id_cart`),
  KEY `id_product` (`id_product`),
  CONSTRAINT `cart_items_fk_1` FOREIGN KEY (`id_cart`) REFERENCES `carts` (`id_cart`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_fk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `orders`
--
CREATE TABLE `orders` (
  `id_order` int NOT NULL AUTO_INCREMENT,
  `id_customer` int DEFAULT NULL,
  `id_employee` int DEFAULT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','CONFIRMED','COMPLETED','CANCELED') DEFAULT 'PENDING' COMMENT 'Trạng thái đơn hàng',
  `total_amount` decimal(15,2) DEFAULT NULL,
  `payment_method` enum('CASH','TRANSFER','ZALOPAY') DEFAULT NULL COMMENT 'Phương thức thanh toán',
  `discount` decimal(15,2) DEFAULT '0.00' COMMENT 'Giảm giá đơn hàng',
  `final_amount` decimal(15,2) GENERATED ALWAYS AS (`total_amount` - `discount`) STORED COMMENT 'Tổng tiền cuối cùng',
  `notes` text COMMENT 'Ghi chú đơn hàng',
  PRIMARY KEY (`id_order`),
  KEY `id_customer` (`id_customer`),
  KEY `id_employee` (`id_employee`),
  CONSTRAINT `orders_fk_1` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id_customer`),
  CONSTRAINT `orders_fk_2` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id_employee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `order_details`
--
CREATE TABLE `order_details` (
  `id_order_detail` int NOT NULL AUTO_INCREMENT,
  `id_order` int DEFAULT NULL,
  `id_product` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(12,2) NOT NULL COMMENT 'Lưu giá tại thời điểm mua',
  PRIMARY KEY (`id_order_detail`),
  KEY `id_order` (`id_order`),
  KEY `id_product` (`id_product`),
  CONSTRAINT `order_details_fk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_details_fk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `purchase_orders`
--
CREATE TABLE `purchase_orders` (
  `id_purchase_order` int NOT NULL AUTO_INCREMENT,
  `id_supplier` int DEFAULT NULL,
  `id_employee` int DEFAULT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id_purchase_order`),
  KEY `id_supplier` (`id_supplier`),
  KEY `id_employee` (`id_employee`),
  CONSTRAINT `purchase_orders_fk_1` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers` (`id_supplier`),
  CONSTRAINT `purchase_orders_fk_2` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id_employee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `purchase_order_details`
--
CREATE TABLE `purchase_order_details` (
  `id_purchase_order_detail` int NOT NULL AUTO_INCREMENT,
  `id_purchase_order` int DEFAULT NULL,
  `id_product` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `import_price` decimal(12,2) NOT NULL COMMENT 'Lưu giá nhập tại thời điểm mua',
  PRIMARY KEY (`id_purchase_order_detail`),
  KEY `id_purchase_order` (`id_purchase_order`),
  KEY `id_product` (`id_product`),
  CONSTRAINT `purchase_order_details_fk_1` FOREIGN KEY (`id_purchase_order`) REFERENCES `purchase_orders` (`id_purchase_order`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchase_order_details_fk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `inventory_transactions`
-- MÔ TẢ: Theo dõi tất cả các giao dịch nhập/xuất kho
--
CREATE TABLE `inventory_transactions` (
  `id_transaction` int NOT NULL AUTO_INCREMENT,
  `id_product` int NOT NULL,
  `transaction_type` enum('IN','OUT') NOT NULL COMMENT 'Nhập/Xuất kho',
  `quantity` int NOT NULL,
  `reference_type` enum('PURCHASE_ORDER','SALE_ORDER','ADJUSTMENT') NOT NULL COMMENT 'Loại giao dịch',
  `reference_id` int DEFAULT NULL COMMENT 'ID của purchase_order hoặc order',
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_employee` int DEFAULT NULL,
  `notes` text COMMENT 'Ghi chú giao dịch',
  PRIMARY KEY (`id_transaction`),
  KEY `id_product` (`id_product`),
  KEY `id_employee` (`id_employee`),
  CONSTRAINT `inventory_transactions_fk_1` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inventory_transactions_fk_2` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`id_employee`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Bảng `shipments`
-- MÔ TẢ: Lưu thông tin vận chuyển đơn hàng, bao gồm trạng thái và vị trí để tích hợp bản đồ
--
CREATE TABLE `shipments` (
  `id_shipment` int NOT NULL AUTO_INCREMENT,
  `id_order` int DEFAULT NULL,
  `shipping_status` enum('PREPARING','SHIPPED','DELIVERED') DEFAULT 'PREPARING' COMMENT 'Trạng thái vận chuyển',
  `tracking_number` varchar(50) DEFAULT NULL,
  `location_lat` decimal(9,6) DEFAULT NULL COMMENT 'Vĩ độ để tích hợp bản đồ',
  `location_long` decimal(9,6) DEFAULT NULL COMMENT 'Kinh độ để tích hợp bản đồ',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_shipment`),
  UNIQUE KEY `id_order` (`id_order`),
  CONSTRAINT `shipments_fk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- End of script --