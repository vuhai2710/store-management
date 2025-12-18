package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_purchase_order")
    private Integer idImportOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_supplier")
    private Supplier supplier;

    @Column(name = "id_employee")
    private Integer idEmployee;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "importOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ImportOrderDetail> importOrderDetails = new ArrayList<>();

    @Column(name = "invoice_printed")
    @Builder.Default
    private Boolean invoicePrinted = false;

    @Column(name = "invoice_printed_at")
    private LocalDateTime invoicePrintedAt;

    @Column(name = "invoice_printed_by")
    private Integer invoicePrintedBy;

    @PrePersist
    protected void onCreate() {
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
        }
    }
}
