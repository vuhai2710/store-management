package com.storemanagement.model;

import com.storemanagement.utils.CodeType;
import com.storemanagement.utils.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_product")
    private Integer idProduct;

    // JOIN để lấy category name
    // Fetch type LAZY để tối ưu performance, JOIN FETCH khi cần
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_category")
    private Category category;

    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "brand", length = 100)
    private String brand;  // Thương hiệu: Apple, Samsung, Dell, Sony, ...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_supplier")
    private Supplier supplier;  // Nhà cung cấp thực sự (optional)

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", precision = 12, scale = 2, nullable = false)
    private java.math.BigDecimal price;

    @Column(name = "stock_quantity")
    @Builder.Default
    private Integer stockQuantity = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ProductStatus status = ProductStatus.IN_STOCK;

    // Giữ lại để backward compatibility - lưu ảnh chính
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    // Relationship với ProductImage - một sản phẩm có nhiều ảnh
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "product_code", nullable = false, unique = true, length = 100)
    private String productCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "code_type")
    @Builder.Default
    private CodeType codeType = CodeType.SKU;

    @Column(name = "sku", unique = true, length = 50)
    private String sku;
}
