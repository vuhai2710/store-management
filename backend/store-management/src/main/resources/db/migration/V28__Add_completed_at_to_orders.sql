ALTER TABLE orders ADD COLUMN completed_at TIMESTAMP NULL;

UPDATE orders 
SET completed_at = COALESCE(delivered_at, updated_at)
WHERE status = 'COMPLETED';
