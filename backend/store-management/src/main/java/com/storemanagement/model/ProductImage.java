package com.storemanagement.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity cho ProductImage (Ảnh sản phẩm)
 * 
 * Mỗi sản phẩm có thể có nhiều ảnh (tối đa 5)
 * Một trong các ảnh sẽ được đánh dấu là ảnh chính (is_primary = true)
 * 
 * Business Rules:
 * - Tối đa 5 ảnh mỗi sản phẩm
 * - Ảnh đầu tiên được upload sẽ là ảnh chính mặc định
 * - Khi xóa ảnh chính, ảnh tiếp theo sẽ trở thành ảnh chính
 * - display_order xác định thứ tự hiển thị (0, 1, 2, 3, 4)
 */
@Entity
@Table(name = "product_images")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_product_image")
    private Integer idProductImage;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_product", nullable = false)
    private Product product;
    
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;
    
    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}





