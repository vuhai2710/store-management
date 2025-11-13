-- ============================================================
-- FLYWAY MIGRATION: V13 - Add Product Reviews Table
-- ============================================================
-- Tạo bảng product_reviews để lưu đánh giá sản phẩm của khách hàng
-- ============================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id_review INT NOT NULL AUTO_INCREMENT,
  id_product INT NOT NULL,
  id_customer INT NOT NULL,
  id_order INT DEFAULT NULL COMMENT 'Reference đến order đã mua sản phẩm',
  id_order_detail INT DEFAULT NULL COMMENT 'Reference đến order detail cụ thể',
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_review),
  KEY idx_reviews_product (id_product),
  KEY idx_reviews_customer (id_customer),
  KEY idx_reviews_order (id_order),
  KEY idx_reviews_order_detail (id_order_detail),
  UNIQUE KEY uq_review_order_detail (id_order_detail) COMMENT 'Mỗi order detail chỉ được review 1 lần',
  CONSTRAINT fk_reviews_product
    FOREIGN KEY (id_product) REFERENCES products(id_product)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_customer
    FOREIGN KEY (id_customer) REFERENCES customers(id_customer)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_order
    FOREIGN KEY (id_order) REFERENCES orders(id_order)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_order_detail
    FOREIGN KEY (id_order_detail) REFERENCES order_details(id_order_detail)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bảng lưu đánh giá sản phẩm của khách hàng';


