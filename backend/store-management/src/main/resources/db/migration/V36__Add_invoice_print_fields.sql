-- Add invoice print tracking columns to orders table (for export invoices)
ALTER TABLE orders
  ADD COLUMN invoice_printed TINYINT(1) DEFAULT 0,
  ADD COLUMN invoice_printed_at DATETIME NULL,
  ADD COLUMN invoice_printed_by INT NULL;

-- Add invoice print tracking columns to purchase_orders table (for import invoices)
ALTER TABLE purchase_orders
  ADD COLUMN invoice_printed TINYINT(1) DEFAULT 0,
  ADD COLUMN invoice_printed_at DATETIME NULL,
  ADD COLUMN invoice_printed_by INT NULL;
