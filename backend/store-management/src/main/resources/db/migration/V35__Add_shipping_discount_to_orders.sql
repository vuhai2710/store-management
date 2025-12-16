-- Add shipping_discount column to orders table
-- This stores shipping-specific discounts separately from order discounts
ALTER TABLE orders
ADD COLUMN shipping_discount DECIMAL(15,2) DEFAULT 0.00
    COMMENT 'Giảm giá phí vận chuyển riêng biệt với giảm giá đơn hàng';

-- Add shipping_promotion_code column to track which shipping promotion was used
ALTER TABLE orders
ADD COLUMN shipping_promotion_code VARCHAR(50) NULL
    COMMENT 'Mã giảm giá phí vận chuyển đã sử dụng';

-- Add foreign key to shipping promotion
ALTER TABLE orders
ADD COLUMN id_shipping_promotion INT NULL,
ADD CONSTRAINT fk_orders_shipping_promotion
    FOREIGN KEY (id_shipping_promotion) REFERENCES promotions(id_promotion)
    ON DELETE SET NULL;

-- Create index for shipping promotion lookups
CREATE INDEX idx_orders_shipping_promotion ON orders(id_shipping_promotion);
