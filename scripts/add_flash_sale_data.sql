-- Script to manually add Flash Sale data if migrations haven't run
-- Run this in your MySQL/MariaDB client

-- Step 1: Check if PRODUCT scope exists in ENUM, if not this won't work
-- You may need to run the ALTER TABLE commands from V38 first

-- Step 2: Create sample PRODUCT-scope promotions (ignore errors if already exists)
INSERT IGNORE INTO promotions (code, discount_type, discount_value, min_order_amount, usage_limit, start_date, end_date, is_active, scope)
VALUES 
    ('FLASH20', 'PERCENTAGE', 20.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 'PRODUCT'),
    ('FLASH15', 'PERCENTAGE', 15.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 'PRODUCT'),
    ('HOT500K', 'FIXED_AMOUNT', 500000.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, 'PRODUCT'),
    ('DEAL25', 'PERCENTAGE', 25.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 1, 'PRODUCT'),
    ('SALE10', 'PERCENTAGE', 10.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 21 DAY), 1, 'PRODUCT');

-- Step 3: Link promotions to products
-- First check what products exist:
-- SELECT id_product, product_name, stock_quantity FROM products LIMIT 10;

-- Link FLASH20 to first product with stock
INSERT IGNORE INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, pr.id_product 
FROM promotions p, products pr 
WHERE p.code = 'FLASH20' 
AND pr.stock_quantity > 0 
ORDER BY pr.id_product 
LIMIT 1;

-- Link FLASH15 to second product with stock  
INSERT IGNORE INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, pr.id_product 
FROM promotions p, products pr 
WHERE p.code = 'FLASH15' 
AND pr.stock_quantity > 0 
AND pr.id_product NOT IN (SELECT id_product FROM promotion_products)
ORDER BY pr.id_product 
LIMIT 1;

-- Link HOT500K to third product
INSERT IGNORE INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, pr.id_product 
FROM promotions p, products pr 
WHERE p.code = 'HOT500K' 
AND pr.stock_quantity > 0 
AND pr.id_product NOT IN (SELECT id_product FROM promotion_products)
ORDER BY pr.id_product 
LIMIT 1;

-- Link DEAL25 to fourth product
INSERT IGNORE INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, pr.id_product 
FROM promotions p, products pr 
WHERE p.code = 'DEAL25' 
AND pr.stock_quantity > 0 
AND pr.id_product NOT IN (SELECT id_product FROM promotion_products)
ORDER BY pr.id_product 
LIMIT 1;

-- Link SALE10 to fifth product
INSERT IGNORE INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, pr.id_product 
FROM promotions p, products pr 
WHERE p.code = 'SALE10' 
AND pr.stock_quantity > 0 
AND pr.id_product NOT IN (SELECT id_product FROM promotion_products)
ORDER BY pr.id_product 
LIMIT 1;

-- Verify:
SELECT p.code, p.discount_type, p.discount_value, p.scope, pp.id_product, pr.product_name
FROM promotions p
LEFT JOIN promotion_products pp ON p.id_promotion = pp.id_promotion
LEFT JOIN products pr ON pp.id_product = pr.id_product
WHERE p.scope = 'PRODUCT';
