-- ============================================================
-- V10: Add chat system tables for Customer-Admin/Employee communication
-- ============================================================

-- Create chat_conversations table
CREATE TABLE chat_conversations (
  id_conversation INT NOT NULL AUTO_INCREMENT,
  id_customer     INT NOT NULL,
  status          ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
  created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_conversation),
  KEY idx_chat_conversations_customer (id_customer),
  KEY idx_chat_conversations_status (status),
  CONSTRAINT fk_chat_conversations_customer
    FOREIGN KEY (id_customer) REFERENCES customers (id_customer)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create chat_messages table
CREATE TABLE chat_messages (
  id_message      INT NOT NULL AUTO_INCREMENT,
  id_conversation INT NOT NULL,
  sender_id       INT NOT NULL COMMENT 'ID of user (customer/employee/admin)',
  sender_type     ENUM('CUSTOMER', 'ADMIN', 'EMPLOYEE') NOT NULL,
  message         TEXT NOT NULL,
  created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_message),
  KEY idx_chat_messages_conversation (id_conversation),
  KEY idx_chat_messages_sender (sender_id, sender_type),
  KEY idx_chat_messages_created (id_conversation, created_at),
  CONSTRAINT fk_chat_messages_conversation
    FOREIGN KEY (id_conversation) REFERENCES chat_conversations (id_conversation)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;





