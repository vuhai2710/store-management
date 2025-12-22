ALTER TABLE products
ADD COLUMN is_delete TINYINT(1) DEFAULT 0 NOT NULL COMMENT 'Soft delete flag';

CREATE INDEX idx_products_is_delete ON products(is_delete);
