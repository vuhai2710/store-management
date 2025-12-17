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

CALL create_index_if_not_exists('orders', 'idx_orders_customer_name', 'id_customer');

CALL create_index_if_not_exists('employees', 'idx_employees_name', 'employee_name');
CALL create_index_if_not_exists('employees', 'idx_employees_phone', 'phone_number');

CALL create_index_if_not_exists('promotions', 'idx_promotions_code', 'code');

CALL create_index_if_not_exists('purchase_orders', 'idx_purchase_orders_supplier', 'id_supplier');

CALL create_index_if_not_exists('customers', 'idx_customers_name', 'customer_name');
CALL create_index_if_not_exists('customers', 'idx_customers_phone', 'phone_number');

CALL create_index_if_not_exists('suppliers', 'idx_suppliers_name', 'supplier_name');

CALL create_index_if_not_exists('products', 'idx_products_name', 'product_name');
CALL create_index_if_not_exists('products', 'idx_products_code', 'product_code');
CALL create_index_if_not_exists('products', 'idx_products_sku', 'sku');

DROP PROCEDURE IF EXISTS create_index_if_not_exists;
