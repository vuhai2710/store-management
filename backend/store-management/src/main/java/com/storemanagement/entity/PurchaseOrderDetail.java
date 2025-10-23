package com.storemanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDetail {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_purchase_order_detail")
    private Integer idPurchaseOrderDetail;
    
    @ManyToOne
    @JoinColumn(name = "id_purchase_order")
    private PurchaseOrder purchaseOrder;
    
    @ManyToOne
    @JoinColumn(name = "id_product")
    private Product product;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "import_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal importPrice;
}
