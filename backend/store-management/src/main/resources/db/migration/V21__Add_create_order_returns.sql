CREATE TABLE order_returns (
    id_return INT AUTO_INCREMENT PRIMARY KEY,
    id_order INT NOT NULL,

    return_type ENUM('RETURN', 'EXCHANGE', 'REFUND_ONLY') NOT NULL,
    status ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'REQUESTED',

    reason TEXT,
    note_admin TEXT,
    refund_amount DECIMAL(15,2),

    created_by_customer_id INT,
    processed_by_employee_id INT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_return_order FOREIGN KEY (id_order) REFERENCES orders(id_order),
    CONSTRAINT fk_return_customer FOREIGN KEY (created_by_customer_id) REFERENCES customers(id_customer),
    CONSTRAINT fk_return_employee FOREIGN KEY (processed_by_employee_id) REFERENCES employees(id_employee)
);

CREATE TABLE order_return_items (
  id_return_item INT AUTO_INCREMENT PRIMARY KEY,
  id_return INT NOT NULL,
  id_order_detail INT NOT NULL,

  quantity INT NOT NULL,

  exchange_product_id INT NULL,
  exchange_quantity INT NULL,

  line_refund_amount DECIMAL(15,2),

  CONSTRAINT fk_return_item FOREIGN KEY (id_return) REFERENCES order_returns(id_return),
  CONSTRAINT fk_return_item_order_detail FOREIGN KEY (id_order_detail) REFERENCES order_details(id_order_detail),
  CONSTRAINT fk_return_exchange FOREIGN KEY (exchange_product_id) REFERENCES products(id_product)
);