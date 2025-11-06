-- ============================================================
-- V4: Add E-commerce fields
-- ============================================================

-- Tạo bảng shipping_addresses
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id_shipping_address INT NOT NULL AUTO_INCREMENT,
  id_customer INT NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_shipping_address),
  KEY idx_shipping_addresses_customer (id_customer),
  CONSTRAINT fk_shipping_addresses_customer
    FOREIGN KEY (id_customer) REFERENCES customers (id_customer)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Thêm các columns vào bảng orders
ALTER TABLE orders 
  ADD COLUMN id_shipping_address INT DEFAULT NULL COMMENT 'Reference đến shipping_addresses',
  ADD COLUMN shipping_address_snapshot TEXT DEFAULT NULL COMMENT 'Snapshot của địa chỉ tại thời điểm đặt hàng',
  ADD KEY idx_orders_shipping_address (id_shipping_address),
  ADD CONSTRAINT fk_orders_shipping_address
    FOREIGN KEY (id_shipping_address) REFERENCES shipping_addresses (id_shipping_address)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Thêm các columns snapshot vào bảng order_details
ALTER TABLE order_details
  ADD COLUMN product_name_snapshot VARCHAR(255) DEFAULT NULL COMMENT 'Tên sản phẩm tại thời điểm mua',
  ADD COLUMN product_code_snapshot VARCHAR(100) DEFAULT NULL COMMENT 'Mã sản phẩm tại thời điểm mua',
  ADD COLUMN product_image_snapshot VARCHAR(500) DEFAULT NULL COMMENT 'URL ảnh tại thời điểm mua';







