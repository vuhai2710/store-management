package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_category")
    private Integer idCategory;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "code_prefix", length = 10)
    private String codePrefix;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
