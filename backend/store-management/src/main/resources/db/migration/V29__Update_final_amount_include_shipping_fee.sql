-- Migration: Update final_amount to include shipping_fee
-- final_amount = total_amount + shipping_fee - discount

-- Step 1: Drop the existing generated column
ALTER TABLE orders DROP COLUMN final_amount;

-- Step 2: Re-add final_amount with shipping_fee included
ALTER TABLE orders
ADD COLUMN final_amount DECIMAL(15,2) 
    GENERATED ALWAYS AS (GREATEST(IFNULL(total_amount, 0) + IFNULL(shipping_fee, 0) - IFNULL(discount, 0), 0)) STORED
    COMMENT 'Tổng tiền cuối = total_amount + shipping_fee - discount (>=0)';
