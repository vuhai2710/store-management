UPDATE orders o
SET o.return_window_days = COALESCE(
    (SELECT CAST(ss.setting_value AS UNSIGNED)
     FROM system_settings ss
     WHERE ss.setting_key = 'RETURN_WINDOW_DAYS'
     LIMIT 1),
    7
)
WHERE o.status = 'COMPLETED'
  AND o.return_window_days IS NULL;

UPDATE orders o
SET o.completed_at = COALESCE(o.delivered_at, o.updated_at, o.order_date)
WHERE o.status = 'COMPLETED'
  AND o.completed_at IS NULL;

UPDATE orders o
SET o.delivered_at = COALESCE(o.completed_at, o.updated_at, o.order_date)
WHERE o.status = 'COMPLETED'
  AND o.delivered_at IS NULL;

SELECT
    COUNT(*) as total_completed,
    SUM(CASE WHEN return_window_days IS NULL THEN 1 ELSE 0 END) as missing_return_window_days,
    SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) as missing_completed_at,
    SUM(CASE WHEN delivered_at IS NULL THEN 1 ELSE 0 END) as missing_delivered_at
FROM orders
WHERE status = 'COMPLETED';
