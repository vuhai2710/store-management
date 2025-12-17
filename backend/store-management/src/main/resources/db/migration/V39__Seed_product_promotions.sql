-- Seed sample product promotions for testing Flash Sale slider
-- Insert PRODUCT-scope promotions linked to existing products

-- First, create sample PRODUCT-scope promotions
INSERT INTO promotions (code, discount_type, discount_value, min_order_amount, usage_limit, start_date, end_date, is_active, scope)
VALUES 
    ('FLASH20', 'PERCENTAGE', 20.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 'PRODUCT'),
    ('FLASH15', 'PERCENTAGE', 15.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 'PRODUCT'),
    ('HOT500K', 'FIXED_AMOUNT', 500000.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, 'PRODUCT'),
    ('DEAL25', 'PERCENTAGE', 25.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 1, 'PRODUCT'),
    ('SALE10', 'PERCENTAGE', 10.00, 0, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 21 DAY), 1, 'PRODUCT');

-- Link promotions to products (only if products exist)
-- FLASH20 -> product 1
INSERT INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, 1 FROM promotions p 
WHERE p.code = 'FLASH20' 
AND EXISTS (SELECT 1 FROM products WHERE id_product = 1 AND stock_quantity > 0);

-- FLASH15 -> product 2
INSERT INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, 2 FROM promotions p 
WHERE p.code = 'FLASH15' 
AND EXISTS (SELECT 1 FROM products WHERE id_product = 2 AND stock_quantity > 0);

-- HOT500K -> product 3
INSERT INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, 3 FROM promotions p 
WHERE p.code = 'HOT500K' 
AND EXISTS (SELECT 1 FROM products WHERE id_product = 3 AND stock_quantity > 0);

-- DEAL25 -> product 4
INSERT INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, 4 FROM promotions p 
WHERE p.code = 'DEAL25' 
AND EXISTS (SELECT 1 FROM products WHERE id_product = 4 AND stock_quantity > 0);

-- SALE10 -> product 5
INSERT INTO promotion_products (id_promotion, id_product)
SELECT p.id_promotion, 5 FROM promotions p 
WHERE p.code = 'SALE10' 
AND EXISTS (SELECT 1 FROM products WHERE id_product = 5 AND stock_quantity > 0);
