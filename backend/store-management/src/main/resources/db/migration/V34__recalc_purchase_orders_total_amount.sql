UPDATE purchase_orders po
JOIN (
    SELECT id_purchase_order, SUM(quantity * import_price) AS sum_amount
    FROM purchase_order_details
    GROUP BY id_purchase_order
) t ON po.id_purchase_order = t.id_purchase_order
SET po.total_amount = IFNULL(t.sum_amount, 0);

UPDATE purchase_orders po
SET po.total_amount = 0
WHERE po.id_purchase_order NOT IN (
    SELECT DISTINCT id_purchase_order FROM purchase_order_details
);
