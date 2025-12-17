ALTER TABLE orders
  ADD COLUMN invoice_printed TINYINT(1) DEFAULT 0,
  ADD COLUMN invoice_printed_at DATETIME NULL,
  ADD COLUMN invoice_printed_by INT NULL;

ALTER TABLE purchase_orders
  ADD COLUMN invoice_printed TINYINT(1) DEFAULT 0,
  ADD COLUMN invoice_printed_at DATETIME NULL,
  ADD COLUMN invoice_printed_by INT NULL;
