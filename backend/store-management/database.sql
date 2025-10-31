-- ============================================================
-- TẠO CƠ SỞ DỮ LIỆU
-- ============================================================
DROP DATABASE IF EXISTS store_management;
CREATE DATABASE store_management CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE store_management;

SET NAMES utf8mb4;

-- ============================================================
-- BẢNG USERS
-- ============================================================
CREATE TABLE users (
  id_user INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'Lưu mật khẩu đã mã hóa',
  email VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','EMPLOYEE','CUSTOMER') NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_user),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id_customer INT NOT NULL AUTO_INCREMENT,
  id_user INT DEFAULT NULL COMMENT 'Liên kết tới bảng users',
  customer_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone_number VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  customer_type ENUM('VIP','REGULAR') DEFAULT 'REGULAR' COMMENT 'Phân loại khách hàng',
  PRIMARY KEY (id_customer),
  UNIQUE KEY id_user (id_user),
  CONSTRAINT customers_fk_1 FOREIGN KEY (id_user) REFERENCES users (id_user)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG EMPLOYEES
-- ============================================================
CREATE TABLE employees (
  id_employee INT NOT NULL AUTO_INCREMENT,
  id_user INT DEFAULT NULL COMMENT 'Liên kết tới bảng users',
  employee_name VARCHAR(255) NOT NULL,
  hire_date DATE DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  address TEXT,
  base_salary DECIMAL(12,2) DEFAULT NULL CHECK (base_salary >= 0),
  PRIMARY KEY (id_employee),
  UNIQUE KEY id_user (id_user),
  CONSTRAINT employees_fk_1 FOREIGN KEY (id_user) REFERENCES users (id_user)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id_category INT NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG PRODUCTS
-- ============================================================
CREATE TABLE products (
  id_product INT NOT NULL AUTO_INCREMENT,
  id_category INT DEFAULT NULL,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  status ENUM('IN_STOCK','OUT_OF_STOCK') DEFAULT 'IN_STOCK' COMMENT 'Trạng thái: IN_STOCK (còn hàng), OUT_OF_STOCK (hết hàng)',
  image_url VARCHAR(500) DEFAULT NULL COMMENT 'Hình ảnh sản phẩm',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_product),
  KEY id_category (id_category),
  CONSTRAINT products_fk_1 FOREIGN KEY (id_category) REFERENCES categories (id_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG SUPPLIERS
-- ============================================================
CREATE TABLE suppliers (
  id_supplier INT NOT NULL AUTO_INCREMENT,
  supplier_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone_number VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_supplier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG CARTS
-- ============================================================
CREATE TABLE carts (
  id_cart INT NOT NULL AUTO_INCREMENT,
  id_customer INT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cart),
  UNIQUE KEY id_customer (id_customer),
  CONSTRAINT carts_fk_1 FOREIGN KEY (id_customer) REFERENCES customers (id_customer)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG CART_ITEMS
-- ============================================================
CREATE TABLE cart_items (
  id_cart_item INT NOT NULL AUTO_INCREMENT,
  id_cart INT NOT NULL,
  id_product INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cart_item),
  KEY id_cart (id_cart),
  KEY id_product (id_product),
  CONSTRAINT cart_items_fk_1 FOREIGN KEY (id_cart) REFERENCES carts (id_cart)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT cart_items_fk_2 FOREIGN KEY (id_product) REFERENCES products (id_product)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG ORDERS
-- ============================================================
CREATE TABLE orders (
  id_order INT NOT NULL AUTO_INCREMENT,
  id_customer INT DEFAULT NULL,
  id_employee INT DEFAULT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('PENDING','CONFIRMED','COMPLETED','CANCELED')
      DEFAULT 'PENDING' COMMENT 'Trạng thái đơn hàng',
  total_amount DECIMAL(15,2) DEFAULT 0.00 CHECK (total_amount >= 0),
  payment_method ENUM('CASH','TRANSFER','ZALOPAY') DEFAULT NULL COMMENT 'Phương thức thanh toán',
  discount DECIMAL(15,2) DEFAULT 0.00 CHECK (discount >= 0) COMMENT 'Giảm giá đơn hàng',
  final_amount DECIMAL(15,2)
      GENERATED ALWAYS AS (IFNULL(total_amount,0) - IFNULL(discount,0)) STORED
      COMMENT 'Tổng tiền cuối cùng',
  notes TEXT COMMENT 'Ghi chú đơn hàng',
  PRIMARY KEY (id_order),
  KEY id_customer (id_customer),
  KEY id_employee (id_employee),
  CONSTRAINT orders_fk_1 FOREIGN KEY (id_customer) REFERENCES customers (id_customer),
  CONSTRAINT orders_fk_2 FOREIGN KEY (id_employee) REFERENCES employees (id_employee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG ORDER_DETAILS
-- ============================================================
CREATE TABLE order_details (
  id_order_detail INT NOT NULL AUTO_INCREMENT,
  id_order INT DEFAULT NULL,
  id_product INT DEFAULT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0) COMMENT 'Lưu giá tại thời điểm mua',
  PRIMARY KEY (id_order_detail),
  KEY id_order (id_order),
  KEY id_product (id_product),
  CONSTRAINT order_details_fk_1 FOREIGN KEY (id_order) REFERENCES orders (id_order)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT order_details_fk_2 FOREIGN KEY (id_product) REFERENCES products (id_product)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG PURCHASE_ORDERS
-- ============================================================
CREATE TABLE purchase_orders (
  id_purchase_order INT NOT NULL AUTO_INCREMENT,
  id_supplier INT DEFAULT NULL,
  id_employee INT DEFAULT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(15,2) DEFAULT 0.00 CHECK (total_amount >= 0),
  PRIMARY KEY (id_purchase_order),
  KEY id_supplier (id_supplier),
  KEY id_employee (id_employee),
  CONSTRAINT purchase_orders_fk_1 FOREIGN KEY (id_supplier) REFERENCES suppliers (id_supplier),
  CONSTRAINT purchase_orders_fk_2 FOREIGN KEY (id_employee) REFERENCES employees (id_employee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG PURCHASE_ORDER_DETAILS
-- ============================================================
CREATE TABLE purchase_order_details (
  id_purchase_order_detail INT NOT NULL AUTO_INCREMENT,
  id_purchase_order INT DEFAULT NULL,
  id_product INT DEFAULT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  import_price DECIMAL(12,2) NOT NULL CHECK (import_price >= 0) COMMENT 'Giá nhập tại thời điểm mua',
  PRIMARY KEY (id_purchase_order_detail),
  KEY id_purchase_order (id_purchase_order),
  KEY id_product (id_product),
  CONSTRAINT purchase_order_details_fk_1 FOREIGN KEY (id_purchase_order) REFERENCES purchase_orders (id_purchase_order)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT purchase_order_details_fk_2 FOREIGN KEY (id_product) REFERENCES products (id_product)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG INVENTORY_TRANSACTIONS
-- ============================================================
CREATE TABLE inventory_transactions (
  id_transaction INT NOT NULL AUTO_INCREMENT,
  id_product INT NOT NULL,
  transaction_type ENUM('IN','OUT') NOT NULL COMMENT 'Nhập/Xuất kho',
  quantity INT NOT NULL CHECK (quantity > 0),
  reference_type ENUM('PURCHASE_ORDER','SALE_ORDER','ADJUSTMENT') NOT NULL COMMENT 'Loại giao dịch',
  reference_id INT DEFAULT NULL COMMENT 'ID của purchase_order hoặc order',
  transaction_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  id_employee INT DEFAULT NULL,
  notes TEXT COMMENT 'Ghi chú giao dịch',
  PRIMARY KEY (id_transaction),
  KEY id_product (id_product),
  KEY id_employee (id_employee),
  CONSTRAINT inventory_transactions_fk_1 FOREIGN KEY (id_product) REFERENCES products (id_product)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT inventory_transactions_fk_2 FOREIGN KEY (id_employee) REFERENCES employees (id_employee)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG SHIPMENTS
-- ============================================================
CREATE TABLE shipments (
  id_shipment INT NOT NULL AUTO_INCREMENT,
  id_order INT DEFAULT NULL,
  shipping_status ENUM('PREPARING','SHIPPED','DELIVERED') DEFAULT 'PREPARING' COMMENT 'Trạng thái vận chuyển',
  tracking_number VARCHAR(50) DEFAULT NULL,
  location_lat DECIMAL(9,6) DEFAULT NULL COMMENT 'Vĩ độ',
  location_long DECIMAL(9,6) DEFAULT NULL COMMENT 'Kinh độ',
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_shipment),
  UNIQUE KEY id_order (id_order),
  CONSTRAINT shipments_fk_1 FOREIGN KEY (id_order) REFERENCES orders (id_order)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE users
ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
AFTER created_at;

ALTER TABLE customers
ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- =====================================================
-- ALTER BẢNG PRODUCTS - THÊM MÃ SẢN PHẨM ĐẶC TRƯNG
-- =====================================================
ALTER TABLE products
ADD COLUMN product_code VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Mã sản phẩm: IMEI/Serial/SKU',
ADD COLUMN code_type ENUM('IMEI','SERIAL','SKU','BARCODE') DEFAULT 'SKU' COMMENT 'Loại mã',
ADD COLUMN sku VARCHAR(50) UNIQUE COMMENT 'SKU theo quy tắc: CAT_PREFIX-XXXX',
ADD UNIQUE KEY unique_product_code (product_code),
ADD INDEX idx_code_type (code_type),
ADD INDEX idx_sku (sku);

-- Cập nhật categories với PREFIX cho SKU
ALTER TABLE categories
ADD COLUMN code_prefix VARCHAR(10) DEFAULT '' COMMENT 'Prefix cho SKU: SP, LT, AO...';

-- -------------------------------------------------
-- Thêm cột id_supplier (brand) vào products
-- -------------------------------------------------
ALTER TABLE products
    ADD COLUMN id_supplier INT NULL COMMENT 'Nhà cung cấp = Brand (Apple, Samsung, Sony...)',
    ADD CONSTRAINT fk_product_supplier
        FOREIGN KEY (id_supplier) REFERENCES suppliers(id_supplier)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- Index để tìm kiếm nhanh theo brand
CREATE INDEX idx_product_supplier ON products(id_supplier);

-- ============================================================
-- KẾT THÚC SCRIPT
-- ============================================================
