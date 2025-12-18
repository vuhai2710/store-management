-- =====================================================================
-- V32: Optimize Search Indexes for Realtime Search
-- MySQL 8.0 Compatible - Idempotent (safe to re-run)
-- =====================================================================

-- Create a stored procedure to safely create index if not exists
DELIMITER //

DROP PROCEDURE IF EXISTS create_index_if_not_exists//

CREATE PROCEDURE create_index_if_not_exists(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_column_name VARCHAR(255)
)
BEGIN
    DECLARE index_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND index_name = p_index_name;
    
    IF index_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX `', p_index_name, '` ON `', p_table_name, '` (', p_column_name, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

DELIMITER ;

-- =====================================================================
-- 1. ORDERS - Search by customer
-- =====================================================================
CALL create_index_if_not_exists('orders', 'idx_orders_customer_name', 'id_customer');

-- =====================================================================
-- 2. EMPLOYEES - Search by name, phone
-- =====================================================================
CALL create_index_if_not_exists('employees', 'idx_employees_name', 'employee_name');
CALL create_index_if_not_exists('employees', 'idx_employees_phone', 'phone_number');

-- =====================================================================
-- 3. PROMOTIONS - Search by code
-- =====================================================================
CALL create_index_if_not_exists('promotions', 'idx_promotions_code', 'code');

-- =====================================================================
-- 4. PURCHASE_ORDERS (Import Orders) - Search by supplier
-- =====================================================================
CALL create_index_if_not_exists('purchase_orders', 'idx_purchase_orders_supplier', 'id_supplier');

-- =====================================================================
-- 5. CUSTOMERS - Search by name, phone
-- =====================================================================
CALL create_index_if_not_exists('customers', 'idx_customers_name', 'customer_name');
CALL create_index_if_not_exists('customers', 'idx_customers_phone', 'phone_number');

-- =====================================================================
-- 6. SUPPLIERS - Search by name
-- =====================================================================
CALL create_index_if_not_exists('suppliers', 'idx_suppliers_name', 'supplier_name');

-- =====================================================================
-- 7. PRODUCTS - Search by name, code, sku
-- =====================================================================
CALL create_index_if_not_exists('products', 'idx_products_name', 'product_name');
CALL create_index_if_not_exists('products', 'idx_products_code', 'product_code');
CALL create_index_if_not_exists('products', 'idx_products_sku', 'sku');

-- =====================================================================
-- Cleanup: Drop the temporary procedure
-- =====================================================================
DROP PROCEDURE IF EXISTS create_index_if_not_exists;
