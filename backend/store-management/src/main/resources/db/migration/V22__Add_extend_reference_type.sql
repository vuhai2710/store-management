ALTER TABLE inventory_transactions MODIFY reference_type ENUM(
    'PURCHASE_ORDER',
    'SALE_ORDER',
    'ADJUSTMENT',
    'SALE_RETURN',
    'SALE_EXCHANGE'
);
