DROP PROCEDURE IF EXISTS add_customer_name_index;

DELIMITER //
CREATE PROCEDURE add_customer_name_index()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'customers'
        AND INDEX_NAME = 'idx_customer_name'
    ) THEN
        CREATE INDEX idx_customer_name ON customers(customer_name(100));
    END IF;
END //
DELIMITER ;

CALL add_customer_name_index();
DROP PROCEDURE IF EXISTS add_customer_name_index;
