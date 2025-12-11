ALTER TABLE chat_conversations
  ADD COLUMN last_viewed_by_admin_at DATETIME NULL COMMENT 'Thời gian admin/employee xem conversation lần cuối',
  ADD COLUMN last_viewed_by_customer_at DATETIME NULL COMMENT 'Thời gian customer xem conversation lần cuối';

CREATE INDEX idx_chat_conversations_last_viewed_admin 
  ON chat_conversations(last_viewed_by_admin_at);

CREATE INDEX idx_chat_conversations_last_viewed_customer 
  ON chat_conversations(last_viewed_by_customer_at);
