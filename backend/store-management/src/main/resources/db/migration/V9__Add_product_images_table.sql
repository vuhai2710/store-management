CREATE TABLE product_images (
  id_product_image INT NOT NULL AUTO_INCREMENT,
  id_product       INT NOT NULL,
  image_url        VARCHAR(500) NOT NULL,
  is_primary       TINYINT(1) DEFAULT 0,
  display_order    INT DEFAULT 0,
  created_at       TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_product_image),
  KEY idx_product_images_product (id_product),
  KEY idx_product_images_primary (id_product, is_primary),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (id_product) REFERENCES products (id_product)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_product_images_order ON product_images (id_product, display_order);
