-- ============================================================
-- V11: Add updated_at column to product_images table
-- ============================================================

-- Add updated_at column to product_images table
ALTER TABLE product_images
ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;



