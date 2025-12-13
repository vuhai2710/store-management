-- Add scope column to promotions table
-- Scope determines what the promotion applies to: ORDER (default) or SHIPPING
ALTER TABLE promotions
ADD COLUMN scope ENUM('ORDER', 'SHIPPING') NOT NULL DEFAULT 'ORDER' 
    COMMENT 'Phạm vi áp dụng: ORDER = giảm giá đơn hàng, SHIPPING = giảm giá phí vận chuyển';

-- Add scope column to promotion_rules table for automatic discounts
ALTER TABLE promotion_rules
ADD COLUMN scope ENUM('ORDER', 'SHIPPING') NOT NULL DEFAULT 'ORDER'
    COMMENT 'Phạm vi áp dụng: ORDER = giảm giá đơn hàng, SHIPPING = giảm giá phí vận chuyển';

-- Add index for scope filtering
CREATE INDEX idx_promotions_scope ON promotions(scope);
CREATE INDEX idx_promotion_rules_scope ON promotion_rules(scope);
