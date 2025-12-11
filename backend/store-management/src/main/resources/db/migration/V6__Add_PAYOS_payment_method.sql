ALTER TABLE orders
MODIFY COLUMN payment_method ENUM('CASH','TRANSFER','ZALOPAY','PAYOS') DEFAULT NULL;

ALTER TABLE orders
ADD COLUMN payment_link_id VARCHAR(255) NULL COMMENT 'PayOS payment link ID - được set khi tạo payment link thành công';

CREATE INDEX idx_orders_payment_link_id ON orders(payment_link_id);