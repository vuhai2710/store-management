-- ============================================================
-- FLYWAY MIGRATION: V8 - Add GHN Integration Fields to Shipments
-- ============================================================
-- Thêm các cột để tích hợp với GHN API (Giao Hàng Nhanh)
-- ============================================================

-- Thêm mã đơn hàng GHN
ALTER TABLE shipments
ADD COLUMN ghn_order_code VARCHAR(50) NULL COMMENT 'Mã đơn hàng từ GHN API';

-- Thêm phí vận chuyển từ GHN
ALTER TABLE shipments
ADD COLUMN ghn_shipping_fee DECIMAL(12,2) NULL COMMENT 'Phí vận chuyển từ GHN';

-- Thêm thời gian giao hàng dự kiến
ALTER TABLE shipments
ADD COLUMN ghn_expected_delivery_time DATETIME NULL COMMENT 'Thời gian giao hàng dự kiến từ GHN';

-- Thêm trạng thái từ GHN
ALTER TABLE shipments
ADD COLUMN ghn_status VARCHAR(50) NULL COMMENT 'Trạng thái đơn hàng từ GHN (ready_to_pick, delivering, delivered, etc.)';

-- Thêm thời gian cập nhật từ GHN
ALTER TABLE shipments
ADD COLUMN ghn_updated_at TIMESTAMP NULL COMMENT 'Thời gian cập nhật trạng thái từ GHN webhook';

-- Thêm ghi chú từ GHN
ALTER TABLE shipments
ADD COLUMN ghn_note TEXT NULL COMMENT 'Ghi chú hoặc lý do từ GHN (ví dụ: lý do giao thất bại)';

-- Thêm phương thức vận chuyển
ALTER TABLE shipments
ADD COLUMN shipping_method ENUM('GHN', 'SELF_PICKUP') DEFAULT 'GHN' COMMENT 'Phương thức vận chuyển: GHN hoặc khách tự đến lấy';

-- Thêm index cho ghn_order_code để tìm kiếm nhanh
CREATE INDEX idx_shipments_ghn_order_code ON shipments(ghn_order_code);

-- Thêm index cho shipping_method
CREATE INDEX idx_shipments_shipping_method ON shipments(shipping_method);
