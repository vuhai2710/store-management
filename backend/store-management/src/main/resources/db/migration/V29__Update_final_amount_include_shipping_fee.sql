ALTER TABLE orders DROP COLUMN final_amount;

ALTER TABLE orders
ADD COLUMN final_amount DECIMAL(15,2)
    GENERATED ALWAYS AS (GREATEST(IFNULL(total_amount, 0) + IFNULL(shipping_fee, 0) - IFNULL(discount, 0), 0)) STORED
    COMMENT 'Tổng tiền cuối = total_amount + shipping_fee - discount (>=0)';
