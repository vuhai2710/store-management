-- ============================================================
-- FLYWAY MIGRATION: V15 - Add GHN Fields to Shipping Addresses
-- ============================================================
-- Thêm các cột province_id, district_id, ward_code vào bảng shipping_addresses
-- để hỗ trợ tích hợp GHN API (Giao Hàng Nhanh)
-- ============================================================

ALTER TABLE shipping_addresses
ADD COLUMN province_id INT NULL COMMENT 'ID tỉnh/thành phố từ GHN API',
ADD COLUMN district_id INT NULL COMMENT 'ID quận/huyện từ GHN API',
ADD COLUMN ward_code VARCHAR(50) NULL COMMENT 'Code phường/xã từ GHN API';

-- Thêm index cho province_id, district_id để tìm kiếm nhanh
CREATE INDEX idx_shipping_addresses_province ON shipping_addresses(province_id);
CREATE INDEX idx_shipping_addresses_district ON shipping_addresses(district_id);

