-- V31: Optimize order_returns search performance
-- Add index for customer_name in customers table (for search by customer name)

-- Create index for customer_name (with prefix for VARCHAR performance)
-- Using DROP IF EXISTS pattern for MySQL compatibility
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

-- Verify existing indexes on order_returns table are in place
-- These were created in V23: idx_return_customer, idx_return_order, idx_return_status
