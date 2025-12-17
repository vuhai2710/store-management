-- Extend promotion scope to support PRODUCT-level promotions
-- Add new scope value 'PRODUCT' to existing ENUM

-- Step 1: Modify promotions.scope to include PRODUCT
ALTER TABLE promotions 
MODIFY COLUMN scope ENUM('ORDER', 'SHIPPING', 'PRODUCT') NOT NULL DEFAULT 'ORDER' 
    COMMENT 'Phạm vi áp dụng: ORDER = giảm giá đơn hàng, SHIPPING = giảm giá phí vận chuyển, PRODUCT = giảm giá sản phẩm';

-- Step 2: Modify promotion_rules.scope to include PRODUCT
ALTER TABLE promotion_rules 
MODIFY COLUMN scope ENUM('ORDER', 'SHIPPING', 'PRODUCT') NOT NULL DEFAULT 'ORDER'
    COMMENT 'Phạm vi áp dụng: ORDER = giảm giá đơn hàng, SHIPPING = giảm giá phí vận chuyển, PRODUCT = giảm giá sản phẩm';

-- Step 3: Create join table to link promotions to specific products
CREATE TABLE IF NOT EXISTS promotion_products (
    id_promotion INT NOT NULL,
    id_product INT NOT NULL,
    PRIMARY KEY (id_promotion, id_product),
    INDEX idx_promotion_products_product (id_product),
    CONSTRAINT fk_promotion_products_promotion 
        FOREIGN KEY (id_promotion) REFERENCES promotions(id_promotion) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_promotion_products_product 
        FOREIGN KEY (id_product) REFERENCES products(id_product) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bảng liên kết promotion với sản phẩm cụ thể';
