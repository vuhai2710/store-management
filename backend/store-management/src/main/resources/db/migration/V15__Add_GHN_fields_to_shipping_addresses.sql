ALTER TABLE shipping_addresses
ADD COLUMN province_id INT NULL COMMENT 'ID tỉnh/thành phố từ GHN API',
ADD COLUMN district_id INT NULL COMMENT 'ID quận/huyện từ GHN API',
ADD COLUMN ward_code VARCHAR(50) NULL COMMENT 'Code phường/xã từ GHN API';

CREATE INDEX idx_shipping_addresses_province ON shipping_addresses(province_id);
CREATE INDEX idx_shipping_addresses_district ON shipping_addresses(district_id);
