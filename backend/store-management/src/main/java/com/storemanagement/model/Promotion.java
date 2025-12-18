package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_promotion")
    private Integer idPromotion;

    @Column(name = "code", length = 50, unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", precision = 12, scale = 2, nullable = false)
    private BigDecimal discountValue;

    @Column(name = "min_order_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "usage_count")
    @Builder.Default
    private Integer usageCount = 0;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", nullable = false)
    @Builder.Default
    private PromotionScope scope = PromotionScope.ORDER;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "promotion_products", joinColumns = @JoinColumn(name = "id_promotion"), inverseJoinColumns = @JoinColumn(name = "id_product"))
    @Builder.Default
    private java.util.Set<Product> products = new java.util.HashSet<>();

    public enum DiscountType {
        PERCENTAGE, FIXED_AMOUNT
    }

    public enum PromotionScope {
        ORDER,
        SHIPPING,
        PRODUCT
    }
}
