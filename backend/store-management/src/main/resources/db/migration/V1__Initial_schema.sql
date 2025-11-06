-- ============================================================
-- FLYWAY MIGRATION: V1 - Initial Database Schema
-- ============================================================
-- File này chứa toàn bộ schema ban đầu của database
-- Flyway sẽ tự động chạy file này khi ứng dụng khởi động lần đầu
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- BẢNG USERS
-- Tài khoản hệ thống: ADMIN / EMPLOYEE / CUSTOMER
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id_user      INT NOT NULL AUTO_INCREMENT,
  username     VARCHAR(100) NOT NULL,
  password     VARCHAR(255) NOT NULL COMMENT 'Lưu mật khẩu đã mã hoá (BCrypt/Argon2)',
  email        VARCHAR(255) NOT NULL,
  role         ENUM('ADMIN','EMPLOYEE','CUSTOMER') NOT NULL,
  is_active    TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_user),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG CUSTOMERS
-- Thông tin khách hàng; liên kết 1-1 (tuỳ chọn) với users
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id_customer    INT NOT NULL AUTO_INCREMENT,
  id_user        INT DEFAULT NULL COMMENT 'Liên kết tới bảng users',
  customer_name  VARCHAR(255) NOT NULL,
  address        TEXT,
  phone_number   VARCHAR(20) NOT NULL,
  customer_type  ENUM('VIP','REGULAR') DEFAULT 'REGULAR',
  created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_customer),
  UNIQUE KEY uq_customers_user (id_user),
  UNIQUE KEY uq_customers_phone (phone_number),
  CONSTRAINT fk_customers_user
    FOREIGN KEY (id_user) REFERENCES users (id_user)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG EMPLOYEES
-- Thông tin nhân viên; liên kết 1-1 (tuỳ chọn) với users
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id_employee   INT NOT NULL AUTO_INCREMENT,
  id_user       INT DEFAULT NULL COMMENT 'Liên kết tới bảng users',
  employee_name VARCHAR(255) NOT NULL,
  hire_date     DATE DEFAULT NULL,
  phone_number  VARCHAR(20) DEFAULT NULL,
  address       TEXT,
  base_salary   DECIMAL(12,2) DEFAULT NULL CHECK (base_salary >= 0),
  created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_employee),
  UNIQUE KEY uq_employees_user (id_user),
  CONSTRAINT fk_employees_user
    FOREIGN KEY (id_user) REFERENCES users (id_user)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG SUPPLIERS
-- Nhà cung cấp/Brand
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id_supplier   INT NOT NULL AUTO_INCREMENT,
  supplier_name VARCHAR(255) NOT NULL,
  address       TEXT,
  phone_number  VARCHAR(20) DEFAULT NULL,
  email         VARCHAR(255) DEFAULT NULL,
  created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_supplier),
  KEY idx_suppliers_name (supplier_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG CATEGORIES
-- Phân loại sản phẩm, có prefix để sinh SKU
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id_category    INT NOT NULL AUTO_INCREMENT,
  category_name  VARCHAR(255) NOT NULL,
  code_prefix    VARCHAR(10)  DEFAULT '' COMMENT 'Prefix cho SKU: SP, LT, AO...',
  created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_category),
  UNIQUE KEY uq_categories_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG PRODUCTS
-- Sản phẩm với mã đặc trưng (IMEI/Serial/SKU/Barcode) + Brand/Supplier
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id_product      INT NOT NULL AUTO_INCREMENT,
  id_category     INT DEFAULT NULL,
  id_supplier     INT DEFAULT NULL COMMENT 'Nhà cung cấp = Brand (Apple, Samsung...)',
  product_name    VARCHAR(255) NOT NULL,
  brand           VARCHAR(100) DEFAULT NULL COMMENT 'Thương hiệu',
  description     TEXT,
  price           DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  stock_quantity  INT DEFAULT 0 CHECK (stock_quantity >= 0),
  status          ENUM('IN_STOCK','OUT_OF_STOCK','DISCONTINUED') DEFAULT 'IN_STOCK',
  image_url       VARCHAR(500) DEFAULT NULL,
  -- Mã sản phẩm đặc trưng
  product_code    VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Mã: IMEI/Serial/SKU/Barcode',
  code_type       ENUM('IMEI','SERIAL','SKU','BARCODE') DEFAULT 'SKU',
  sku             VARCHAR(50) UNIQUE COMMENT 'SKU: PREFIX-XXXX',
  created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_product),
  KEY idx_products_category (id_category),
  KEY idx_products_supplier (id_supplier),
  KEY idx_products_brand (brand),
  UNIQUE KEY uq_products_product_code (product_code),
  KEY idx_products_code_type (code_type),
  KEY idx_products_sku (sku),
  CONSTRAINT fk_products_category
    FOREIGN KEY (id_category) REFERENCES categories (id_category)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_products_supplier
    FOREIGN KEY (id_supplier) REFERENCES suppliers (id_supplier)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG CARTS
-- Mỗi khách hàng có tối đa 1 giỏ hàng
-- ============================================================
CREATE TABLE IF NOT EXISTS carts (
  id_cart     INT NOT NULL AUTO_INCREMENT,
  id_customer INT NOT NULL,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cart),
  UNIQUE KEY uq_carts_customer (id_customer),
  CONSTRAINT fk_carts_customer
    FOREIGN KEY (id_customer) REFERENCES customers (id_customer)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG CART_ITEMS
-- Ràng buộc duy nhất (id_cart, id_product) để không trùng dòng
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id_cart_item INT NOT NULL AUTO_INCREMENT,
  id_cart      INT NOT NULL,
  id_product   INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cart_item),
  UNIQUE KEY uq_cart_items_cart_product (id_cart, id_product),
  KEY idx_cart_items_cart (id_cart),
  KEY idx_cart_items_product (id_product),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (id_cart) REFERENCES carts (id_cart)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (id_product) REFERENCES products (id_product)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG ORDERS
-- final_amount = total_amount - discount (không âm)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id_order        INT NOT NULL AUTO_INCREMENT,
  id_customer     INT DEFAULT NULL,
  id_employee     INT DEFAULT NULL,
  order_date      DATETIME DEFAULT CURRENT_TIMESTAMP,
  status          ENUM('PENDING','CONFIRMED','COMPLETED','CANCELED') DEFAULT 'PENDING',
  total_amount    DECIMAL(15,2) DEFAULT 0.00 CHECK (total_amount >= 0),
  discount        DECIMAL(15,2) DEFAULT 0.00 CHECK (discount >= 0),
  payment_method  ENUM('CASH','TRANSFER','ZALOPAY') DEFAULT NULL,
  final_amount    DECIMAL(15,2)
                    GENERATED ALWAYS AS (GREATEST(IFNULL(total_amount,0) - IFNULL(discount,0),0)) STORED
                    COMMENT 'Tổng tiền cuối (>=0)',
  notes           TEXT,
  created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_order),
  KEY idx_orders_customer (id_customer),
  KEY idx_orders_employee (id_employee),
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (id_customer) REFERENCES customers (id_customer)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_orders_employee
    FOREIGN KEY (id_employee) REFERENCES employees (id_employee)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG ORDER_DETAILS
-- Ràng buộc duy nhất (id_order, id_product) tránh trùng dòng
-- ============================================================
CREATE TABLE IF NOT EXISTS order_details (
  id_order_detail INT NOT NULL AUTO_INCREMENT,
  id_order        INT NOT NULL,
  id_product      INT NOT NULL,
  quantity        INT NOT NULL CHECK (quantity > 0),
  price           DECIMAL(12,2) NOT NULL CHECK (price >= 0) COMMENT 'Giá tại thời điểm mua',
  PRIMARY KEY (id_order_detail),
  UNIQUE KEY uq_order_details_order_product (id_order, id_product),
  KEY idx_order_details_order (id_order),
  KEY idx_order_details_product (id_product),
  CONSTRAINT fk_order_details_order
    FOREIGN KEY (id_order) REFERENCES orders (id_order)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_details_product
    FOREIGN KEY (id_product) REFERENCES products (id_product)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG PURCHASE_ORDERS (Đơn nhập)
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id_purchase_order INT NOT NULL AUTO_INCREMENT,
  id_supplier       INT DEFAULT NULL,
  id_employee       INT DEFAULT NULL,
  order_date        DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount      DECIMAL(15,2) DEFAULT 0.00 CHECK (total_amount >= 0),
  created_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_purchase_order),
  KEY idx_po_supplier (id_supplier),
  KEY idx_po_employee (id_employee),
  CONSTRAINT fk_po_supplier
    FOREIGN KEY (id_supplier) REFERENCES suppliers (id_supplier)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_po_employee
    FOREIGN KEY (id_employee) REFERENCES employees (id_employee)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG PURCHASE_ORDER_DETAILS
-- Ràng buộc duy nhất (id_purchase_order, id_product)
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_order_details (
  id_purchase_order_detail INT NOT NULL AUTO_INCREMENT,
  id_purchase_order        INT NOT NULL,
  id_product               INT NOT NULL,
  quantity                 INT NOT NULL CHECK (quantity > 0),
  import_price             DECIMAL(12,2) NOT NULL CHECK (import_price >= 0),
  PRIMARY KEY (id_purchase_order_detail),
  UNIQUE KEY uq_po_details_order_product (id_purchase_order, id_product),
  KEY idx_po_details_order (id_purchase_order),
  KEY idx_po_details_product (id_product),
  CONSTRAINT fk_po_details_order
    FOREIGN KEY (id_purchase_order) REFERENCES purchase_orders (id_purchase_order)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_po_details_product
    FOREIGN KEY (id_product) REFERENCES products (id_product)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG INVENTORY_TRANSACTIONS
-- Ghi nhận nhập/xuất kho; dùng reference_type + reference_id để tham chiếu mềm
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id_transaction   INT NOT NULL AUTO_INCREMENT,
  id_product       INT NOT NULL,
  transaction_type ENUM('IN','OUT') NOT NULL,
  quantity         INT NOT NULL CHECK (quantity > 0),
  reference_type   ENUM('PURCHASE_ORDER','SALE_ORDER','ADJUSTMENT') NOT NULL,
  reference_id     INT DEFAULT NULL COMMENT 'ID của purchase_orders / orders (tuỳ loại)',
  transaction_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  id_employee      INT DEFAULT NULL,
  notes            TEXT,
  PRIMARY KEY (id_transaction),
  KEY idx_inv_product (id_product),
  KEY idx_inv_employee (id_employee),
  KEY idx_inv_ref (reference_type, reference_id),
  CONSTRAINT fk_inv_product
    FOREIGN KEY (id_product) REFERENCES products (id_product)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inv_employee
    FOREIGN KEY (id_employee) REFERENCES employees (id_employee)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BẢNG SHIPMENTS
-- Theo dõi vận chuyển cho đơn hàng (1-1 với orders)
-- ============================================================
CREATE TABLE IF NOT EXISTS shipments (
  id_shipment     INT NOT NULL AUTO_INCREMENT,
  id_order        INT NOT NULL,
  shipping_status ENUM('PREPARING','SHIPPED','DELIVERED') DEFAULT 'PREPARING',
  tracking_number VARCHAR(50) DEFAULT NULL,
  location_lat    DECIMAL(9,6) DEFAULT NULL COMMENT 'Vĩ độ',
  location_long   DECIMAL(9,6) DEFAULT NULL COMMENT 'Kinh độ',
  created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_shipment),
  UNIQUE KEY uq_shipments_order (id_order),
  CONSTRAINT fk_shipments_order
    FOREIGN KEY (id_order) REFERENCES orders (id_order)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;





















