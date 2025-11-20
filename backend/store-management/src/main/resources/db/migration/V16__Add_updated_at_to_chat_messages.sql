-- Add missing updated_at column to chat_messages to align with BaseEntity mapping
ALTER TABLE chat_messages
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;



