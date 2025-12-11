ALTER TABLE orders
ADD COLUMN return_window_days INT NULL COMMENT 'Snapshot số ngày cho phép đổi/trả tại thời điểm hoàn thành đơn';

-- Backfill return_window_days cho các đơn COMPLETED cũ
UPDATE orders o
SET o.return_window_days = COALESCE(
    (SELECT CAST(ss.setting_value AS UNSIGNED) FROM system_settings ss WHERE ss.setting_key = 'RETURN_WINDOW_DAYS' LIMIT 1),
    7
)
WHERE o.status = 'COMPLETED' AND o.return_window_days IS NULL;

-- Backfill deliveredAt cho các đơn COMPLETED cũ (sử dụng order_date nếu chưa có deliveredAt)
UPDATE orders o
SET o.delivered_at = o.order_date
WHERE o.status = 'COMPLETED' AND o.delivered_at IS NULL;
