ALTER TABLE shipments
ADD COLUMN ghn_order_code VARCHAR(50) NULL COMMENT 'Mã đơn hàng từ GHN API';

ALTER TABLE shipments
ADD COLUMN ghn_shipping_fee DECIMAL(12,2) NULL COMMENT 'Phí vận chuyển từ GHN';

ALTER TABLE shipments
ADD COLUMN ghn_expected_delivery_time DATETIME NULL COMMENT 'Thời gian giao hàng dự kiến từ GHN';

ALTER TABLE shipments
ADD COLUMN ghn_status VARCHAR(50) NULL COMMENT 'Trạng thái đơn hàng từ GHN (ready_to_pick, delivering, delivered, etc.)';

ALTER TABLE shipments
ADD COLUMN ghn_updated_at TIMESTAMP NULL COMMENT 'Thời gian cập nhật trạng thái từ GHN webhook';

ALTER TABLE shipments
ADD COLUMN ghn_note TEXT NULL COMMENT 'Ghi chú hoặc lý do từ GHN (ví dụ: lý do giao thất bại)';

ALTER TABLE shipments
ADD COLUMN shipping_method ENUM('GHN', 'SELF_PICKUP') DEFAULT 'GHN' COMMENT 'Phương thức vận chuyển: GHN hoặc khách tự đến lấy';

CREATE INDEX idx_shipments_ghn_order_code ON shipments(ghn_order_code);

CREATE INDEX idx_shipments_shipping_method ON shipments(shipping_method);
