-- Notification module deprecated
-- Date: 2025-12-17
-- This table is no longer in use. The Notification feature has been removed from the application.
-- The table is preserved for historical data. It can be safely dropped in a future migration
-- if the data is no longer needed.

-- Add a comment to the table to mark it as deprecated
ALTER TABLE notifications COMMENT = '[DEPRECATED] Notification module removed. Table preserved for historical data.';
