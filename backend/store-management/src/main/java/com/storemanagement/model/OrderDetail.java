package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_order_detail")
    private Integer idOrderDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_product", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price", precision = 12, scale = 2, nullable = false)
    private BigDecimal price; // Giá tại thời điểm mua

    @Column(name = "product_name_snapshot", length = 255)
    private String productNameSnapshot; // Tên sản phẩm tại thời điểm mua

    @Column(name = "product_code_snapshot", length = 100)
    private String productCodeSnapshot; // Mã sản phẩm tại thời điểm mua

    @Column(name = "product_image_snapshot", length = 500)
    private String productImageSnapshot; // URL ảnh tại thời điểm mua
}




