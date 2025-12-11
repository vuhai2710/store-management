package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_returns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_return")
    private Integer idReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_type")
    private ReturnType returnType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReturnStatus status;

    private String reason;
    private String noteAdmin;
    private BigDecimal refundAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_customer_id")
    private Customer createdByCustomer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_employee_id")
    private Employee processedByEmployee;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "orderReturn", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderReturnItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ReturnType {
        RETURN,
        EXCHANGE
    }

    public enum ReturnStatus {
        REQUESTED,
        APPROVED,
        REJECTED,
        COMPLETED
    }
}
