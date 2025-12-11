ALTER TABLE order_returns
    CHANGE COLUMN update_at updated_at DATETIME
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE order_returns
    MODIFY return_type ENUM('RETURN', 'EXCHANGE') NOT NULL;

ALTER TABLE order_return_items
    DROP FOREIGN KEY fk_return_item;

ALTER TABLE order_return_items
    ADD CONSTRAINT fk_return_item
        FOREIGN KEY (id_return)
        REFERENCES order_returns(id_return)
        ON DELETE CASCADE;

CREATE INDEX idx_return_customer ON order_returns(created_by_customer_id);
CREATE INDEX idx_return_order ON order_returns(id_order);
CREATE INDEX idx_return_status ON order_returns(status);