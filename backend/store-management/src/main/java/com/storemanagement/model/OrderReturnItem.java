package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_return_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderReturnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_return_item")
    private Integer idReturnItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_return")
    private OrderReturn orderReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order_detail")
    private OrderDetail orderDetail;

    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exchange_product_id")
    private Product exchangeProduct;

    private Integer exchangeQuantity;
    private BigDecimal lineRefundAmount;
}
