-- Add last_viewed_by_admin_at and last_viewed_by_customer_at columns to chat_conversations
-- These fields track when admin/employee or customer last viewed a conversation
-- Used to calculate unread message count more accurately

ALTER TABLE chat_conversations
  ADD COLUMN last_viewed_by_admin_at DATETIME NULL COMMENT 'Thời gian admin/employee xem conversation lần cuối',
  ADD COLUMN last_viewed_by_customer_at DATETIME NULL COMMENT 'Thời gian customer xem conversation lần cuối';

-- Add index for performance when filtering by last viewed time
CREATE INDEX idx_chat_conversations_last_viewed_admin 
  ON chat_conversations(last_viewed_by_admin_at);

CREATE INDEX idx_chat_conversations_last_viewed_customer 
  ON chat_conversations(last_viewed_by_customer_at);
