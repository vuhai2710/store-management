package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportOrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_purchase_order_detail")
    private Integer idImportOrderDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_purchase_order", nullable = false)
    private ImportOrder importOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_product", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "import_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal importPrice;  // Giá nhập tại thời điểm mua
}







