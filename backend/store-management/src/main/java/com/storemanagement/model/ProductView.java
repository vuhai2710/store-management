package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_view")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductView extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @Column(name = "action_type", nullable = false, length = 20)
    private String actionType;
}

