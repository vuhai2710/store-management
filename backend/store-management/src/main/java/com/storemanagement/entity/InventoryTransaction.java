package com.storemanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transaction")
    private Integer idTransaction;
    
    @ManyToOne
    @JoinColumn(name = "id_product", nullable = false)
    private Product product;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", nullable = false)
    private ReferenceType referenceType;
    
    @Column(name = "reference_id")
    private Integer referenceId;
    
    @CreationTimestamp
    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;
    
    @ManyToOne
    @JoinColumn(name = "id_employee")
    private Employee employee;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    public enum TransactionType {
        IN, OUT
    }
    
    public enum ReferenceType {
        PURCHASE_ORDER, SALE_ORDER, ADJUSTMENT
    }
}
