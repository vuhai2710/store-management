-- ============================================================
-- FLYWAY MIGRATION: V14 - Add Promotions and Rules Tables
-- ============================================================
-- Tạo bảng promotions, promotion_usage, promotion_rules để hỗ trợ mã giảm giá và discount tự động
-- ============================================================

-- ============================================================
-- BẢNG PROMOTIONS (Mã giảm giá)
-- ============================================================
CREATE TABLE IF NOT EXISTS promotions (
  id_promotion INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(15,2) DEFAULT 0.00,
  usage_limit INT DEFAULT NULL COMMENT 'Số lần sử dụng tối đa (NULL = không giới hạn)',
  usage_count INT DEFAULT 0,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_promotion),
  UNIQUE KEY uq_promotions_code (code),
  KEY idx_promotions_active (is_active),
  KEY idx_promotions_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bảng lưu mã giảm giá';

-- ============================================================
-- BẢNG PROMOTION_USAGE (Lịch sử sử dụng mã giảm giá)
-- ============================================================
CREATE TABLE IF NOT EXISTS promotion_usage (
  id_usage INT NOT NULL AUTO_INCREMENT,
  id_promotion INT NOT NULL,
  id_order INT NOT NULL,
  id_customer INT NOT NULL,
  used_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usage),
  KEY idx_usage_promotion (id_promotion),
  KEY idx_usage_order (id_order),
  KEY idx_usage_customer (id_customer),
  CONSTRAINT fk_usage_promotion
    FOREIGN KEY (id_promotion) REFERENCES promotions(id_promotion)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_usage_order
    FOREIGN KEY (id_order) REFERENCES orders(id_order)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_usage_customer
    FOREIGN KEY (id_customer) REFERENCES customers(id_customer)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bảng lưu lịch sử sử dụng mã giảm giá';

-- ============================================================
-- BẢNG PROMOTION_RULES (Quy tắc giảm giá tự động)
-- ============================================================
CREATE TABLE IF NOT EXISTS promotion_rules (
  id_rule INT NOT NULL AUTO_INCREMENT,
  rule_name VARCHAR(255) NOT NULL,
  discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(15,2) DEFAULT 0.00,
  customer_type ENUM('VIP', 'REGULAR', 'ALL') DEFAULT 'ALL',
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  priority INT DEFAULT 0 COMMENT 'Ưu tiên (số càng cao càng ưu tiên)',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_rule),
  KEY idx_rules_active (is_active),
  KEY idx_rules_dates (start_date, end_date),
  KEY idx_rules_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bảng lưu quy tắc giảm giá tự động';

-- ============================================================
-- CẬP NHẬT BẢNG ORDERS (Thêm các cột liên quan đến promotion)
-- ============================================================
ALTER TABLE orders
ADD COLUMN id_promotion INT NULL COMMENT 'Reference đến promotions (nếu sử dụng mã giảm giá)',
ADD COLUMN promotion_code VARCHAR(50) NULL COMMENT 'Mã giảm giá được sử dụng',
ADD COLUMN id_promotion_rule INT NULL COMMENT 'Reference đến promotion_rules (nếu áp dụng discount tự động)',
ADD KEY idx_orders_promotion (id_promotion),
ADD KEY idx_orders_promotion_rule (id_promotion_rule),
ADD CONSTRAINT fk_orders_promotion
  FOREIGN KEY (id_promotion) REFERENCES promotions(id_promotion)
  ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT fk_orders_promotion_rule
  FOREIGN KEY (id_promotion_rule) REFERENCES promotion_rules(id_rule)
  ON DELETE SET NULL ON UPDATE CASCADE;



