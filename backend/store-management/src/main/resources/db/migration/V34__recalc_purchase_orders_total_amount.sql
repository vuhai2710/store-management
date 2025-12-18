-- Flyway Migration V34: Recalculate purchase_orders.total_amount from purchase_order_details
-- This fixes any stale/incorrect total_amount values in the database
-- totalAmount should equal SUM(quantity * import_price) of all details

UPDATE purchase_orders po
JOIN (
    SELECT id_purchase_order, SUM(quantity * import_price) AS sum_amount
    FROM purchase_order_details
    GROUP BY id_purchase_order
) t ON po.id_purchase_order = t.id_purchase_order
SET po.total_amount = IFNULL(t.sum_amount, 0);

-- Also set total_amount = 0 for orders without any details (edge case)
UPDATE purchase_orders po
SET po.total_amount = 0
WHERE po.id_purchase_order NOT IN (
    SELECT DISTINCT id_purchase_order FROM purchase_order_details
);
